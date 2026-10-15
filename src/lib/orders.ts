import { getOrder, markOrderPaid, markOrderFulfilled } from "@/lib/db";
import { fulfillOrder, isMayaConfigured } from "@/lib/maya";
import { isBlinkConfigured } from "@/lib/blink";
import { sendTopup } from "@/lib/reloadly";
import { sendTransfer } from "@/lib/dingconnect";
import { sendEsimEmail, sendTopupEmail } from "@/lib/email";
import { getPlan, formatData } from "@/lib/plans";
import { getTopup } from "@/lib/topups";

// Single entry point for "payment confirmed" — called from the Blink webhook (real payments) and
// from the mock-mode timeout in POST /api/orders (no Blink credentials yet). Keeping both paths
// funnel through here means fulfillment logic only exists once.
export async function confirmAndFulfillOrder(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  if (!order || order.status !== "pending") return; // already handled, or unknown order

  await markOrderPaid(orderId);

  if (order.product_type === "topup") {
    await fulfillTopupOrder(orderId, order.plan_id, order.recipient_phone, order.contact, order.locale);
  } else {
    await fulfillEsimOrder(orderId, order.plan_id, order.contact, order.locale);
  }
}

async function fulfillEsimOrder(
  orderId: string,
  planId: string,
  contact: string,
  locale: string
): Promise<void> {
  // A real payment for an eSIM with no real provider (e.g. an invoice created before sales
  // closed): leave the order "paid" for a manual refund rather than emailing a mock code
  if (isBlinkConfigured() && !isMayaConfigured()) {
    console.error(`eSIM order ${orderId} was paid but Maya isn't configured: not fulfilled, refund it manually`);
    return;
  }
  try {
    const esim = await fulfillOrder({ planId, orderId });
    await markOrderFulfilled(orderId, { esimReference: esim.esimReference });

    // Email-only delivery for now — `contact` can also be a phone number (see checkout.contactLabel),
    // and SMS/WhatsApp delivery into DRC isn't built yet (see CLAUDE.md). Skip silently rather than
    // erroring: the order is still correctly "fulfilled", just not auto-delivered for this contact.
    if (contact.includes("@")) {
      try {
        const plan = await getPlan(planId);
        await sendEsimEmail({
          to: contact,
          locale,
          planSummary: plan
            ? `${plan.network} · ${formatData(plan.dataAmountMb)} · ${plan.validityDays}d`
            : planId,
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

async function fulfillTopupOrder(
  orderId: string,
  topupId: string,
  recipientPhone: string | null,
  contact: string,
  locale: string
): Promise<void> {
  if (!recipientPhone) {
    console.error(`Topup order ${orderId} has no recipient_phone — cannot fulfill`);
    return;
  }

  try {
    const topup = await getTopup(topupId);
    if (!topup) throw new Error(`unknown topup id ${topupId}`);

    // Dispatch to whichever provider this catalog entry actually came from — and critically, pay
    // the provider's own wholesale amount (topup.reloadlyWholesaleUsd / dingconnectSendValue), NOT
    // topup.priceUsd (the marked-up customer-facing price). Both providers expect an exact
    // wholesale figure from their own product list, not an arbitrary amount.
    const topupReference =
      topup.provider === "dingconnect"
        ? (
            await sendTransfer({
              skuCode: topup.dingconnectSkuCode,
              recipientPhone,
              sendValue: topup.dingconnectSendValue,
              sendCurrencyIso: topup.dingconnectSendCurrencyIso,
              orderId,
            })
          ).transferReference
        : (
            await sendTopup({
              operatorId: topup.reloadlyOperatorId,
              recipientPhone,
              recipientCountryCode: topup.countryCode,
              amountUsd: topup.reloadlyWholesaleUsd,
              orderId,
            })
          ).transactionId;
    await markOrderFulfilled(orderId, { topupReference });

    if (contact.includes("@")) {
      try {
        await sendTopupEmail({
          to: contact,
          locale,
          topupSummary: `${topup.network} · ${formatData(topup.dataAmountMb)} · ${topup.validityDays}d`,
          recipientPhone,
        });
      } catch (err) {
        // order stays "fulfilled" — the top-up itself already landed, only the confirmation
        // email failed, recoverable by resending manually rather than reprocessing the order
        console.error(`Topup confirmation email failed to send for order ${orderId}:`, err);
      }
    }
  } catch (err) {
    // payment succeeded but fulfillment failed (e.g. Reloadly API error) — order stays "paid"
    // rather than "fulfilled" so it's visible for manual follow-up rather than silently lost
    console.error(`Fulfillment failed for order ${orderId}:`, err);
  }
}
