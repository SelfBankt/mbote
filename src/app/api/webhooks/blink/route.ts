import { NextRequest, NextResponse } from "next/server";
import { getOrderByPaymentHash } from "@/lib/db";
import { confirmAndFulfillOrder } from "@/lib/orders";
import { verifyWebhookSignature, WebhookVerificationError } from "@/lib/blink";

// Receives Blink's `receive.lightning` webhook event (see src/lib/blink.ts header for the payload
// shape and the signature-verification scheme). The raw body text is read *before* JSON parsing —
// signature verification is computed over the exact bytes Blink sent, and re-serializing a parsed
// object would almost certainly produce different bytes (key order, whitespace) and make every
// signature check fail.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "missing svix headers" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = verifyWebhookSignature(rawBody, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      // deliberately vague response — don't help an attacker distinguish "bad signature" from
      // "bad timestamp" from other failure modes
      return NextResponse.json({ error: "signature verification failed" }, { status: 401 });
    }
    throw err; // BLINK_WEBHOOK_SECRET missing, etc. — a real server error, not an auth failure
  }

  const event = payload as {
    eventType?: string;
    transaction?: {
      id?: string;
      paymentHash?: string;
      initiationVia?: { paymentHash?: string };
    };
  };

  if (!event || event.eventType !== "receive.lightning") {
    return NextResponse.json({ ok: true }); // ignore anything we don't handle
  }

  // Blink's `transaction.id` is an internal ledger transaction ID, NOT the Lightning payment
  // hash — confirmed by introspecting Blink's live GraphQL schema (2026-08-06): `Transaction` has
  // no top-level `paymentHash` field, only `id`. The real payment hash (the same value returned
  // by `lnInvoiceCreate` and stored as `blink_payment_hash`) lives under the `InitiationViaLn`
  // variant of the `initiationVia` union, as `initiationVia.paymentHash`. Using `transaction.id`
  // here meant this lookup could never match a stored order — the webhook verified fine and
  // returned 200, but silently no-opped on every real payment (order stayed "pending" forever).
  const paymentHash =
    event.transaction?.initiationVia?.paymentHash ??
    event.transaction?.paymentHash ??
    event.transaction?.id;
  if (!paymentHash) {
    return NextResponse.json({ error: "missing transaction id" }, { status: 400 });
  }

  const order = await getOrderByPaymentHash(paymentHash);
  if (!order) {
    // not necessarily an error — could be a payment to this Blink account unrelated to mbote
    return NextResponse.json({ ok: true });
  }

  await confirmAndFulfillOrder(order.id);
  return NextResponse.json({ ok: true });
}
