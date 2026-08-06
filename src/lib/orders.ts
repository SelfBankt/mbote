import { getOrder, markOrderPaid, markOrderFulfilled } from "@/lib/db";
import { fulfillOrder } from "@/lib/maya";

// Single entry point for "payment confirmed" — called from the Blink webhook (real payments) and
// from the mock-mode timeout in POST /api/orders (no Blink credentials yet). Keeping both paths
// funnel through here means fulfillment logic only exists once.
export async function confirmAndFulfillOrder(orderId: string): Promise<void> {
  const order = getOrder(orderId);
  if (!order || order.status !== "pending") return; // already handled, or unknown order

  markOrderPaid(orderId);

  try {
    const esim = await fulfillOrder({ planId: order.plan_id, orderId: order.id });
    markOrderFulfilled(orderId, esim.esimReference);
    // TODO once real delivery is needed: email/SMS `esim.lpaActivationCode` to `order.contact`.
    // Not built yet since it needs a transactional email/SMS provider decision — out of scope for
    // this scaffold, but this is the exact point to hook it in.
  } catch (err) {
    // payment succeeded but fulfillment failed (e.g. Maya Mobile API error) — order stays "paid"
    // rather than "fulfilled" so it's visible for manual follow-up rather than silently lost
    console.error(`Fulfillment failed for order ${orderId}:`, err);
  }
}
