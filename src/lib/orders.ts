import { getOrder, markOrderPaid, markOrderFulfilled } from "@/lib/db";
import { fulfillOrder } from "@/lib/maya";
import { sendEsimEmail } from "@/lib/email";
import { getPlan, formatData } from "@/lib/plans";

// Single entry point for "payment confirmed" — called from the Blink webhook (real payments) and
// from the mock-mode timeout in POST /api/orders (no Blink credentials yet). Keeping both paths
// funnel through here means fulfillment logic only exists once.
export async function confirmAndFulfillOrder(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  if (!order || order.status !== "pending") return; // already handled, or unknown order

  await markOrderPaid(orderId);

  try {
    const esim = await fulfillOrder({ planId: order.plan_id, orderId: order.id });
    await markOrderFulfilled(orderId, esim.esimReference);

    // Email-only delivery for now — `contact` can also be a phone number (see checkout.contactLabel),
    // and SMS/WhatsApp delivery into DRC isn't built yet (see CLAUDE.md). Skip silently rather than
    // erroring: the order is still correctly "fulfilled", just not auto-delivered for this contact.
    if (order.contact.includes("@")) {
      try {
        const plan = await getPlan(order.plan_id);
        await sendEsimEmail({
          to: order.contact,
          locale: order.locale,
          planSummary: plan
            ? `${plan.network} · ${formatData(plan.dataAmountMb)} · ${plan.validityDays}d`
            : order.plan_id,
          lpaActivationCode: esim.lpaActivationCode,
        });
      } catch (err) {
        // order stays "fulfilled" — the eSIM itself is provisioned, only the notification email
        // failed, which is recoverable by resending manually rather than reprocessing the order
        console.error(`eSIM email failed to send for order ${orderId}:`, err);
      }
    }
  } catch (err) {
    // payment succeeded but fulfillment failed (e.g. Maya Mobile API error) — order stays "paid"
    // rather than "fulfilled" so it's visible for manual follow-up rather than silently lost
    console.error(`Fulfillment failed for order ${orderId}:`, err);
  }
}
