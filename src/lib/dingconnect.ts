// DingConnect (dingconnect.com, part of Ding) — second data top-up provider alongside Reloadly
// (src/lib/reloadly.ts). Confirmed against a real production account (2026-08-07):
// `GET /api/V1/GetProducts?CountryIsos=CD&Benefits=Data` returns real DRC data-bundle products for
// TWO networks — Vodacom (ProviderCode VDCD, 18 SKUs) and Airtel (ProviderCode AICD, 8 SKUs).
// Orange (ORCD) and Africell (AFCD) exist as DRC providers on DingConnect but have no product
// tagged with the "Data" benefit, same "real, confirmed gap" treatment as elsewhere in this app.
//
// DingConnect's own marketing/docs site (dingconnect.com) and help center are behind a Cloudflare
// bot challenge that blocks non-browser fetches, so the request/response shapes below come from a
// third-party open-source PHP client's generated API docs
// (github.com/parenthesislab/dingconnect-api-php) cross-checked against real live responses from
// this account — not the (inaccessible) official reference. Reconcile against the official docs if
// they ever become fetchable, or the moment anything here misbehaves against the real API.
//
// Auth: a single `api_key` HTTP header (DingConnect also supports OAuth2 client-credentials via
// idp.ding.com for newer integrations, but the API key is what was issued for this account).
//
// Pricing quirk worth remembering: GetProducts quotes wholesale cost as `SendValue` in the agent
// account's billing currency (GBP for this account) against a USD-denominated `ReceiveValue` (the
// bundle's real-world value) — unlike Reloadly, which quotes wholesale straight in USD. See
// src/lib/fx.ts for the GBP->USD conversion used to make DingConnect products comparable/markable-up
// on the same USD basis as Reloadly ones in src/lib/topups.ts.

import { getGbpToUsdRate } from "@/lib/fx";

const API_BASE_URL = "https://api.dingconnect.com";

// Confirmed via a live GetProviders?CountryIsos=CD call (2026-08-07) — DingConnect's provider
// codes are stable product identifiers, not worth re-fetching on every catalog refresh.
const PROVIDER_CODE_TO_NETWORK: Record<string, "Vodacom" | "Orange" | "Airtel"> = {
  VDCD: "Vodacom",
  ORCD: "Orange",
  AICD: "Airtel",
  // AFCD (Africell) deliberately omitted — not a network this site currently lists (see plans.ts)
};

export function isDingConnectConfigured(): boolean {
  return Boolean(process.env.DINGCONNECT_API_KEY);
}

export type DingConnectDataProduct = {
  skuCode: string;
  network: "Vodacom" | "Orange" | "Airtel";
  displayText: string; // e.g. "3.6GB Data Bundle" — free-text from DingConnect, parsed by topups.ts
  validityPeriodIso: string; // ISO8601 duration, e.g. "P7D" — may be empty/unreliable, see topups.ts
  wholesaleSendValue: number; // cost to us, in wholesaleSendCurrencyIso
  wholesaleSendCurrencyIso: string; // "GBP" for this account
  wholesaleUsd: number; // wholesaleSendValue converted via fx.ts — what topups.ts marks up
};

function authHeaders(): HeadersInit {
  return {
    api_key: process.env.DINGCONNECT_API_KEY as string,
    Accept: "application/json, text/json",
  };
}

// Fetches every DRC product tagged with the "Data" benefit, converts wholesale cost to USD, and
// tags each with a known network. Does NOT filter/parse the free-text displayText into a GB amount
// or validate the validity period — that's done in topups.ts, since it's catalog/display logic, not
// API-client logic.
export async function getDrcDataProducts(): Promise<DingConnectDataProduct[]> {
  if (!isDingConnectConfigured()) {
    return getDrcDataProductsMock();
  }

  const res = await fetch(`${API_BASE_URL}/api/V1/GetProducts?CountryIsos=CD&Benefits=Data`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`DingConnect GetProducts error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  if (data.ResultCode !== 1) {
    throw new Error(`DingConnect GetProducts returned ResultCode ${data.ResultCode}: ${JSON.stringify(data.ErrorCodes)}`);
  }

  const gbpToUsd = await getGbpToUsdRate();

  const products: DingConnectDataProduct[] = [];
  for (const item of data.Items ?? []) {
    const network = PROVIDER_CODE_TO_NETWORK[item.ProviderCode];
    if (!network) continue; // Orange/Africell (no data product) or an unrecognized provider code

    const wholesaleSendValue = item.Minimum?.SendValue;
    const wholesaleSendCurrencyIso = item.Minimum?.SendCurrencyIso;
    if (typeof wholesaleSendValue !== "number" || !wholesaleSendCurrencyIso) continue;

    const wholesaleUsd =
      wholesaleSendCurrencyIso === "USD" ? wholesaleSendValue : wholesaleSendValue * gbpToUsd;

    products.push({
      skuCode: item.SkuCode,
      network,
      displayText: item.DefaultDisplayText ?? "",
      validityPeriodIso: item.ValidityPeriodIso ?? "",
      wholesaleSendValue,
      wholesaleSendCurrencyIso,
      wholesaleUsd,
    });
  }
  return products;
}

function getDrcDataProductsMock(): DingConnectDataProduct[] {
  return [
    {
      skuCode: "mock-VDCD00000",
      network: "Vodacom",
      displayText: "3.6GB Data Bundle",
      validityPeriodIso: "P7D",
      wholesaleSendValue: 3.72,
      wholesaleSendCurrencyIso: "GBP",
      wholesaleUsd: 3.72 * 1.27,
    },
    {
      skuCode: "mock-AICD00000",
      network: "Airtel",
      displayText: "1GB-24H Data",
      validityPeriodIso: "P1D",
      wholesaleSendValue: 0.38,
      wholesaleSendCurrencyIso: "GBP",
      wholesaleUsd: 0.38 * 1.27,
    },
  ];
}

export type FulfilledTransfer = {
  transferReference: string; // DingConnect's TransferId — stored on the order for support lookups
  processingState: string;
};

export async function sendTransfer(params: {
  skuCode: string;
  recipientPhone: string;
  sendValue: number; // wholesale amount, in sendCurrencyIso — NOT the customer-facing marked-up price
  sendCurrencyIso: string;
  orderId: string; // mbote's own order id, used as DistributorRef for idempotency
}): Promise<FulfilledTransfer> {
  if (!isDingConnectConfigured()) {
    return sendTransferMock(params);
  }

  const res = await fetch(`${API_BASE_URL}/api/V1/SendTransfer`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      SkuCode: params.skuCode,
      SendValue: params.sendValue,
      SendCurrencyIso: params.sendCurrencyIso,
      AccountNumber: params.recipientPhone,
      DistributorRef: params.orderId,
      ValidateOnly: false,
    }),
  });
  if (!res.ok) {
    throw new Error(`DingConnect SendTransfer error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  if (data.ResultCode !== 1) {
    throw new Error(`DingConnect SendTransfer returned ResultCode ${data.ResultCode}: ${JSON.stringify(data.ErrorCodes)}`);
  }

  const record = data.TransferRecord;
  return {
    transferReference: String(record?.TransferId?.Id ?? record?.TransferId ?? params.orderId),
    processingState: record?.ProcessingState ?? "Unknown",
  };
}

function sendTransferMock(params: { orderId: string }): FulfilledTransfer {
  return {
    transferReference: `mock-dc-${params.orderId.slice(0, 8)}`,
    processingState: "Complete",
  };
}
