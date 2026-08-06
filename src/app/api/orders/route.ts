import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getPlan } from "@/lib/plans";
import { createInvoice, usdToSats } from "@/lib/blink";
import { createOrder } from "@/lib/db";
import { confirmAndFulfillOrder } from "@/lib/orders";
import { routing } from "@/i18n/routing";

const bodySchema = z.object({
  planId: z.string().min(1),
  contact: z.string().min(3), // email or phone — kept loose since either is valid for delivery
  locale: z.enum(routing.locales),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }
  const { planId, contact, locale } = parsed.data;

  const plan = await getPlan(planId);
  if (!plan) {
    return NextResponse.json({ error: "plan not found" }, { status: 404 });
  }

  const orderId = randomUUID();
  const satoshis = usdToSats(plan.priceUsd);
  const invoice = await createInvoice({
    satoshis,
    memo: `mbote: ${plan.network} ${plan.dataAmountMb}MB / ${plan.validityDays}d (order ${orderId})`,
  });

  await createOrder({
    id: orderId,
    plan_id: plan.id,
    contact,
    locale,
    price_usd: plan.priceUsd,
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
