"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export default function BuyForm({
  planId,
  locale,
  productType,
}: {
  planId: string;
  locale: string;
  productType: "esim" | "topup";
}) {
  const t = useTranslations();
  const router = useRouter();
  const [contact, setContact] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          productType,
          contact,
          locale,
          ...(productType === "topup" ? { recipientPhone } : {}),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "order failed");
      const { orderId } = await res.json();
      router.push(`/checkout/${orderId}`);
    } catch {
      setError(t("common.error"));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {productType === "topup" && (
        <div>
          <label htmlFor="recipientPhone" className="block text-sm font-medium mb-1">
            {t("checkout.recipientPhoneLabel")}
          </label>
          <input
            id="recipientPhone"
            type="tel"
            required
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder={t("checkout.recipientPhonePlaceholder")}
            className="w-full border border-line rounded-lg px-3 py-2 bg-white"
          />
        </div>
      )}
      <div>
        <label htmlFor="contact" className="block text-sm font-medium mb-1">
          {productType === "topup" ? t("checkout.contactLabelOptional") : t("checkout.contactLabel")}
        </label>
        <input
          id="contact"
          type="text"
          required={productType !== "topup"}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={t("checkout.contactPlaceholder")}
          className="w-full border border-line rounded-lg px-3 py-2 bg-white"
        />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-accent text-brand font-semibold rounded-full px-6 py-3 hover:brightness-105 transition disabled:opacity-60"
      >
        {submitting ? t("common.loading") : t("checkout.startOrder")}
      </button>
    </form>
  );
}
