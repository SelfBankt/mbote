import { NextRequest, NextResponse } from "next/server";
import { getOrderByPaymentHash } from "@/lib/db";
import { confirmAndFulfillOrder } from "@/lib/orders";

// Receives Blink's `receive.lightning` webhook event (see src/lib/blink.ts header for the payload
// shape as documented publicly). NOT YET SIGNATURE-VERIFIED — Blink delivers webhooks via Svix,
// and this should check the svix-id/svix-timestamp/svix-signature headers before trusting the
// body, but that wasn't confirmed against Blink's own docs (see verifyWebhookSignature() in
// src/lib/blink.ts). Do not point a real BLINK_API_KEY at this endpoint until that's implemented
// — right now anyone who finds this URL could POST a fake "payment confirmed" event.
export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);
  if (!payload || payload.eventType !== "receive.lightning") {
    return NextResponse.json({ ok: true }); // ignore anything we don't handle
  }

  const paymentHash: string | undefined = payload.transaction?.id ?? payload.transaction?.paymentHash;
  if (!paymentHash) {
    return NextResponse.json({ error: "missing transaction id" }, { status: 400 });
  }

  const order = getOrderByPaymentHash(paymentHash);
  if (!order) {
    // not necessarily an error — could be a payment to this Blink account unrelated to mbote
    return NextResponse.json({ ok: true });
  }

  await confirmAndFulfillOrder(order.id);
  return NextResponse.json({ ok: true });
}
