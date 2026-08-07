"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { OrderStatus } from "@/lib/db";
import { buildMachankuraUssdHint } from "@/lib/machankura";

export default function CheckoutClient({
  orderId,
  status: initialStatus,
  invoice,
  qrDataUrl,
  planSummary,
  priceUsd,
  productType,
  recipientPhone,
}: {
  orderId: string;
  status: OrderStatus;
  invoice: string | null;
  qrDataUrl: string | null;
  planSummary: string;
  priceUsd: number;
  productType: "esim" | "topup";
  recipientPhone: string | null;
}) {
  const t = useTranslations();
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status !== "pending") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status !== status) setStatus(data.status);
      } catch {
        // transient network hiccup — next poll will retry, no need to surface an error for this
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [orderId, status]);

  async function copyInvoice() {
    if (!invoice) return;
    await navigator.clipboard.writeText(invoice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isDone = status === "paid" || status === "fulfilled";
  const isFailed = status === "expired" || status === "failed";

  return (
    <div className="max-w-md mx-auto px-5 py-12">
      <h1 className="text-2xl font-bold">{t("checkout.title")}</h1>
      <p className="mt-1 text-sm text-foreground/70">
        {planSummary} — ${priceUsd}
      </p>

      {isDone && (
        <div className="mt-8 text-center border border-success/30 bg-success/10 rounded-2xl p-8">
          <div className="text-4xl mb-3" aria-hidden>
            ✅
          </div>
          <p className="font-semibold text-success">{t("checkout.paymentConfirmed")}</p>
          <p className="mt-2 text-sm text-foreground/70">
            {productType === "topup"
              ? t("checkout.deliveryNoteTopup", { phone: recipientPhone ?? "" })
              : t("checkout.deliveryNote")}
          </p>
        </div>
      )}

      {isFailed && (
        <div className="mt-8 text-center border border-danger/30 bg-danger/10 rounded-2xl p-8">
          <p className="font-semibold text-danger">{t("checkout.paymentFailed")}</p>
        </div>
      )}

      {!isDone && !isFailed && (
        <>
          <div className="mt-8 border border-line rounded-2xl p-6 bg-white/60 text-center">
            <p className="font-medium mb-4">{t("checkout.scanQr")}</p>
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- a data: URL, next/image adds no value here
              <img src={qrDataUrl} alt="Lightning invoice QR code" className="mx-auto rounded-lg" width={280} height={280} />
            )}
            <button
              type="button"
              onClick={copyInvoice}
              className="mt-4 text-sm border border-line rounded-full px-4 py-2 hover:border-brand transition"
            >
              {copied ? t("common.copied") : `${t("checkout.orPasteInvoice")} — ${t("common.copy")}`}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-foreground/60">
              <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
              {t("checkout.waitingForPayment")}
            </div>
          </div>

          <div className="mt-6 border border-line rounded-2xl p-5 bg-accent-soft/40">
            <p className="font-medium">{t("checkout.machankuraTitle")}</p>
            <p className="mt-1 text-sm text-foreground/70">{t("checkout.machankuraBody")}</p>
            <p className="mt-3 text-xs font-mono text-foreground/60">{buildMachankuraUssdHint()}</p>
          </div>
        </>
      )}
    </div>
  );
}
