import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getOrder } from "@/lib/db";
import { getPlan, formatData } from "@/lib/plans";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({
  params,
}: PageProps<"/[locale]/checkout/[orderId]">) {
  const { locale, orderId } = await params;
  setRequestLocale(locale);

  const order = await getOrder(orderId);
  if (!order) notFound();
  const plan = await getPlan(order.plan_id);
  if (!plan) notFound();

  const qrDataUrl = order.lightning_invoice
    ? await QRCode.toDataURL(order.lightning_invoice, { width: 280, margin: 1 })
    : null;

  return (
    <CheckoutClient
      orderId={order.id}
      status={order.status}
      invoice={order.lightning_invoice}
      qrDataUrl={qrDataUrl}
      planSummary={`${plan.network} · ${formatData(plan.dataAmountMb)} · ${plan.validityDays}d`}
      priceUsd={order.price_usd}
    />
  );
}
