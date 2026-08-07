// Transactional email — sends the eSIM QR code + activation instructions once an order is
// fulfilled. Uses Resend's HTTP API directly (https://resend.com/docs/api-reference/emails/send-email)
// via plain fetch rather than the `resend` npm package, to avoid a dependency for a single POST call.
//
// RESEND_API_KEY is unset until a real Resend account + verified sending domain exist — with it
// unset, sendEsimEmail() logs what it would have sent instead of calling the API, so the
// fulfillment flow can be exercised end-to-end without a real account (same mock-mode pattern as
// src/lib/blink.ts and src/lib/maya.ts).
//
// EMAIL_FROM must be an address on a domain verified in the Resend dashboard (e.g.
// "MboteData <orders@mbotedata.com>") — Resend rejects sends from unverified domains.

import QRCode from "qrcode";
import { createTranslator, hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";

const RESEND_API_URL = "https://api.resend.com/emails";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export type EsimEmailParams = {
  to: string;
  locale: string; // order.locale is stored as a plain string — validate against known locales here
  planSummary: string; // e.g. "Vodacom · 1 GB · 7d" — already formatted, not translated
  lpaActivationCode: string;
};

export async function sendEsimEmail(params: EsimEmailParams): Promise<void> {
  const locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;
  const t = createTranslator({ locale, messages, namespace: "email" });

  const qrPng = await QRCode.toBuffer(params.lpaActivationCode, { width: 320, margin: 1 });

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p>${t("greeting")}</p>
      <p>${t("intro")}</p>
      <p><strong>${t("planLabel")}:</strong> ${escapeHtml(params.planSummary)}</p>
      <h3>${t("instructionsTitle")}</h3>
      <p>${t("instructionsBody")}</p>
      <p style="font-family: monospace; word-break: break-all; background: #f4f4f4; padding: 8px 12px; border-radius: 6px;">
        <strong>${t("manualCodeLabel")}:</strong><br />
        ${escapeHtml(params.lpaActivationCode)}
      </p>
      <p>${t("supportNote")}</p>
      <p>${t("footer")}</p>
    </div>
  `;

  const text = [
    t("greeting"),
    t("intro"),
    `${t("planLabel")}: ${params.planSummary}`,
    t("instructionsTitle"),
    t("instructionsBody"),
    `${t("manualCodeLabel")}: ${params.lpaActivationCode}`,
    t("supportNote"),
    t("footer"),
  ].join("\n\n");

  if (!isEmailConfigured()) {
    console.log(
      `[mock email] would send "${t("subject")}" to ${params.to} with QR for code ${params.lpaActivationCode}`
    );
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "MboteData <onboarding@resend.dev>",
      to: params.to,
      subject: t("subject"),
      html,
      text,
      attachments: [
        {
          filename: "esim-qr.png",
          content: qrPng.toString("base64"),
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
  }
}

export type TopupEmailParams = {
  to: string;
  locale: string;
  topupSummary: string; // e.g. "Vodacom · 1 GB · 7d" — already formatted, not translated
  recipientPhone: string;
};

// No QR/attachment here, unlike sendEsimEmail — a top-up has nothing to install, it's just a
// confirmation that data was added directly to recipientPhone.
export async function sendTopupEmail(params: TopupEmailParams): Promise<void> {
  const locale = hasLocale(routing.locales, params.locale) ? params.locale : routing.defaultLocale;
  const messages = (await import(`../messages/${locale}.json`)).default;
  const t = createTranslator({ locale, messages, namespace: "email" });

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
      <p>${t("greeting")}</p>
      <p>${t("topupIntro")}</p>
      <p><strong>${t("planLabel")}:</strong> ${escapeHtml(params.topupSummary)}</p>
      <p><strong>${t("topupRecipientLabel")}:</strong> ${escapeHtml(params.recipientPhone)}</p>
      <h3>${t("topupInstructionsTitle")}</h3>
      <p>${t("topupInstructionsBody")}</p>
      <p>${t("supportNote")}</p>
      <p>${t("footer")}</p>
    </div>
  `;

  const text = [
    t("greeting"),
    t("topupIntro"),
    `${t("planLabel")}: ${params.topupSummary}`,
    `${t("topupRecipientLabel")}: ${params.recipientPhone}`,
    t("topupInstructionsTitle"),
    t("topupInstructionsBody"),
    t("supportNote"),
    t("footer"),
  ].join("\n\n");

  if (!isEmailConfigured()) {
    console.log(
      `[mock email] would send "${t("topupSubject")}" to ${params.to} for top-up on ${params.recipientPhone}`
    );
    return;
  }

  const res = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "MboteData <onboarding@resend.dev>",
      to: params.to,
      subject: t("topupSubject"),
      html,
      text,
    }),
  });

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status} ${await res.text()}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
