import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getPlan } from "@/lib/plans";
import { getTopup } from "@/lib/topups";
import { createInvoice, usdToSats } from "@/lib/blink";
import { createOrder } from "@/lib/db";
import { confirmAndFulfillOrder } from "@/lib/orders";
import { routing } from "@/i18n/routing";

const bodySchema = z
  .object({
    planId: z.string().min(1),
    productType: z.enum(["esim", "topup"]).default("esim"),
    contact: z.string().min(3), // email or phone — kept loose since either is valid for delivery
    recipientPhone: z.string().min(6).optional(), // required for topup orders, checked below
    locale: z.enum(routing.locales),
  })
  .refine((body) => body.productType !== "topup" || Boolean(body.recipientPhone), {
    message: "recipientPhone is required for topup orders",
    path: ["recipientPhone"],
  });

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const { planId, productType, contact, recipientPhone, locale } = parsed.data;

  const offer = productType === "topup" ? await getTopup(planId) : await getPlan(planId);
  if (!offer) {
    return NextResponse.json({ error: "plan not found" }, { status: 404 });
  }
  // defense in depth — the UI never links to an unavailable topup's checkout, but don't accept
  // payment for one even if reached directly (see topups.ts: Orange/Airtel have no confirmed
  // Reloadly data product for DRC yet)
  if (productType === "topup" && !("available" in offer && offer.available)) {
    return NextResponse.json({ error: "this top-up is not available yet" }, { status: 400 });
  }

  const orderId = randomUUID();
  const satoshis = usdToSats(offer.priceUsd);
  const memo =
    productType === "topup"
      ? `mbote: ${offer.network} top-up ${offer.dataAmountMb}MB / ${offer.validityDays}d for ${recipientPhone} (order ${orderId})`
      : `mbote: ${offer.network} ${offer.dataAmountMb}MB / ${offer.validityDays}d (order ${orderId})`;
  const invoice = await createInvoice({ satoshis, memo });

  await createOrder({
    id: orderId,
    plan_id: offer.id,
    product_type: productType,
    contact,
    recipient_phone: productType === "topup" ? (recipientPhone ?? null) : null,
    locale,
    price_usd: offer.priceUsd,
    amount_sats: satoshis,
    lightning_invoice: invoice.paymentRequest,
    blink_payment_hash: invoice.paymentHash,
  });

  // mock mode only: without real Blink credentials there's no webhook to ever confirm payment,
  // so simulate one arriving a few seconds later — lets the whole checkout flow (QR, polling,
  // success state, mock eSIM fulfillment) be exercised end-to-end. Real Blink payments are
  // confirmed via the webhook route below, not this.
  if (!process.env.BLINK_API_KEY) {
    setTimeout(() => {
      confirmAndFulfillOrder(orderId).catch((err) =>
        console.error(`Mock payment confirmation failed for ${orderId}:`, err)
      );
    }, 6000);
  }

  return NextResponse.json({ orderId, invoice: invoice.paymentRequest, satoshis });
}
