// Reloadly Airtime & Data Topups API client — data top-ups fulfillment for orders where the
// customer already has an active SIM on a DRC network (Vodacom/Orange/Airtel) and just wants more
// data on that number. Unlike Maya Mobile's eSIM path there's no provisioning step, no QR code, no
// LPA code: a successful topup() call is the entire fulfillment.
//
// Reloadly's API reference is public (developers.reloadly.com, no partner NDA), unlike Maya's, and
// this has now been confirmed end-to-end against a real production account (2026-08-07): token
// issuance, the DRC operator lookup, and the request/response shapes below. One correction from an
// earlier version of this file worth remembering — the OAuth host is `auth.reloadly.com`, NOT
// `accounts.reloadly.com` (the latter doesn't resolve; easy guess to get wrong since Reloadly's own
// marketing/support pages use "accounts" loosely). `operatorId` is account/country-specific — see
// src/lib/topups.ts for the confirmed DRC values (Vodacom only; Orange/Airtel have no data product).
//
// Auth is OAuth2 client-credentials against Reloadly's shared auth service, with a distinct
// audience per environment (sandbox vs production) — the topups API host differs too.
//
// sendTopup() itself (an actual, real, billable data top-up) has NOT been exercised against
// production — only token auth and the read-only operator lookup have. Confirm a real send works
// end-to-end (ideally against sandbox first, if sandbox credentials become available) before
// relying on this for real customer orders.

const ACCOUNTS_TOKEN_URL = "https://auth.reloadly.com/oauth/token";

function isSandbox(): boolean {
  return process.env.RELOADLY_SANDBOX === "true";
}

function topupsApiUrl(): string {
  return isSandbox() ? "https://topups-sandbox.reloadly.com" : "https://topups.reloadly.com";
}

export function isReloadlyConfigured(): boolean {
  return Boolean(process.env.RELOADLY_CLIENT_ID && process.env.RELOADLY_CLIENT_SECRET);
}

// In-memory token cache — fine for a serverless function's warm-invocation lifetime, same
// trade-off already accepted elsewhere in this codebase (no shared cache infra exists yet).
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.accessToken;

  const res = await fetch(ACCOUNTS_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.RELOADLY_CLIENT_ID,
      client_secret: process.env.RELOADLY_CLIENT_SECRET,
      grant_type: "client_credentials",
      audience: topupsApiUrl(),
    }),
  });

  if (!res.ok) {
    throw new Error(`Reloadly auth error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    accessToken: data.access_token,
    // refresh a minute early rather than racing an exact expiry
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.accessToken;
}

export type FulfilledTopup = {
  transactionId: string; // Reloadly's transaction id — stored on the order for support lookups
  status: string;
};

export async function sendTopup(params: {
  operatorId: number;
  recipientPhone: string;
  recipientCountryCode: string; // ISO 3166-1 alpha-2, e.g. "CD"
  // The operator's exact wholesale fixedAmount (see ReloadlyDataProduct.wholesaleUsd) — NOT
  // topups.ts's marked-up customer-facing priceUsd. This operator is FIXED-denomination, so
  // Reloadly expects one of its own enumerated fixedAmounts verbatim; sending an arbitrary
  // marked-up price would not match any real product.
  amountUsd: number;
  orderId: string; // mbote's own order id, passed as a custom identifier
}): Promise<FulfilledTopup> {
  if (!isReloadlyConfigured()) {
    return sendTopupMock(params);
  }

  const token = await getAccessToken();
  const res = await fetch(`${topupsApiUrl()}/topups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/com.reloadly.topups-v1+json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      operatorId: params.operatorId,
      amount: params.amountUsd,
      useLocalAmount: false,
      customIdentifier: params.orderId,
      recipientPhone: {
        countryCode: params.recipientCountryCode,
        number: params.recipientPhone,
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Reloadly API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return {
    transactionId: String(data.transactionId ?? data.id),
    status: data.status ?? "SUCCESSFUL",
  };
}

function sendTopupMock(params: { orderId: string }): FulfilledTopup {
  return {
    transactionId: `mock-${params.orderId.slice(0, 8)}`,
    status: "SUCCESSFUL",
  };
}

// Confirmed via a live GET /operators/countries/CD call (2026-08-07) — the only DRC operator with
// a real data product (see src/lib/topups.ts header comment for the full coverage picture).
export const VODACOM_DATA_OPERATOR_ID = 1326;

export type ReloadlyDataProduct = {
  operatorId: number;
  network: "Vodacom";
  displayText: string; // e.g. "3.6GB Data Bundle (7 Days)" — Reloadly's fixedAmountsDescriptions text
  wholesaleUsd: number; // one of the operator's fixedAmounts — must be sent back verbatim as `amount`
};

// Every DRC data product available for a FIXED-denomination operator, straight from Reloadly's own
// operator detail (already USD, no FX conversion needed unlike DingConnect — see fx.ts). Parsing
// the displayText into a GB amount / validity period, and filtering out night-restricted bundles,
// is catalog/display logic and lives in topups.ts, not here — same split as dingconnect.ts.
export async function getDrcDataProducts(): Promise<ReloadlyDataProduct[]> {
  if (!isReloadlyConfigured()) {
    return getDrcDataProductsMock();
  }

  const token = await getAccessToken();
  const res = await fetch(`${topupsApiUrl()}/operators/${VODACOM_DATA_OPERATOR_ID}`, {
    headers: {
      Accept: "application/com.reloadly.topups-v1+json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Reloadly GetOperator error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();

  const fixedAmounts: number[] = data.fixedAmounts ?? [];
  const descriptions: Record<string, string> = data.fixedAmountsDescriptions ?? {};
  return fixedAmounts.map((amount) => ({
    operatorId: VODACOM_DATA_OPERATOR_ID,
    network: "Vodacom" as const,
    displayText: descriptions[amount.toFixed(2)] ?? descriptions[String(amount)] ?? "",
    wholesaleUsd: amount,
  }));
}

function getDrcDataProductsMock(): ReloadlyDataProduct[] {
  return [
    { operatorId: VODACOM_DATA_OPERATOR_ID, network: "Vodacom", displayText: "3.6GB Data Bundle (7 Days)", wholesaleUsd: 3.72 },
    { operatorId: VODACOM_DATA_OPERATOR_ID, network: "Vodacom", displayText: "13GB Data Bundle (30 Days)", wholesaleUsd: 7.43 },
  ];
}
