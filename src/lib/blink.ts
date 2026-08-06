// Blink (blink.sv) Lightning wallet API client. Verified against Blink's public developer docs
// (dev.blink.sv) — not guessed:
//   - GraphQL endpoint: https://api.blink.sv/graphql (mainnet), api.staging.blink.sv for staging
//   - Auth: `X-API-KEY` header, from the Blink Dashboard's API Keys page
//   - Invoice creation: `lnInvoiceCreate(input: LnInvoiceCreateInput!)` mutation, returning
//     `{ invoice: { paymentRequest, paymentHash, paymentSecret, satoshis }, errors: [...] }`
//   - Payment confirmation: webhooks (registered via the Dashboard or the `callbackEndpointAdd`
//     mutation), event type `receive.lightning`, payload `{ accountId, eventType, walletId,
//     transaction: { id, settlementAmount, settlementCurrency, status, createdAt, ... } }`.
//     Delivery is via Svix — signature verification should use Svix's standard headers
//     (svix-id/svix-timestamp/svix-signature); this wasn't confirmed against Blink's own docs
//     directly, so verify against dev.blink.sv before trusting webhook payloads in production
//     (see `verifyWebhookSignature` below, currently a TODO stub).
//
// BLINK_API_KEY / BLINK_WALLET_ID are unset until a real Blink merchant account exists — with
// them unset, everything here runs in mock mode: a fake invoice is generated and the order flips
// to "paid" a few seconds later (see route handlers), so the whole checkout flow — QR code,
// polling, success state — can be built and tested end-to-end before real credentials exist.

const BLINK_API_URL =
  process.env.BLINK_API_URL ?? "https://api.blink.sv/graphql";

export function isBlinkConfigured(): boolean {
  return Boolean(process.env.BLINK_API_KEY && process.env.BLINK_WALLET_ID);
}

export type CreatedInvoice = {
  paymentRequest: string; // bolt11 invoice string, shown as a QR code
  paymentHash: string;
  satoshis: number;
};

async function blinkGraphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(BLINK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": process.env.BLINK_API_KEY as string,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Blink API error: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Blink GraphQL error: ${json.errors.map((e: { message: string }) => e.message).join(", ")}`);
  }
  return json.data as T;
}

const LN_INVOICE_CREATE = `
  mutation LnInvoiceCreate($input: LnInvoiceCreateInput!) {
    lnInvoiceCreate(input: $input) {
      invoice {
        paymentRequest
        paymentHash
        satoshis
      }
      errors {
        message
      }
    }
  }
`;

export async function createInvoice(params: {
  satoshis: number;
  memo: string;
}): Promise<CreatedInvoice> {
  if (!isBlinkConfigured()) {
    return createMockInvoice(params);
  }

  const data = await blinkGraphQL<{
    lnInvoiceCreate: { invoice: CreatedInvoice | null; errors: { message: string }[] };
  }>(LN_INVOICE_CREATE, {
    input: {
      walletId: process.env.BLINK_WALLET_ID,
      amount: params.satoshis,
      memo: params.memo,
    },
  });

  const { invoice, errors } = data.lnInvoiceCreate;
  if (!invoice) {
    throw new Error(`Couldn't create Blink invoice: ${errors.map((e) => e.message).join(", ")}`);
  }
  return invoice;
}

function createMockInvoice(params: { satoshis: number; memo: string }): CreatedInvoice {
  const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return {
    // not a real bolt11 invoice — just something that renders as a QR code and looks plausible
    // in mock mode; real invoices come back from Blink once BLINK_API_KEY is set
    paymentRequest: `lnbc${params.satoshis}n1mock${fakeHash.slice(0, 20)}`,
    paymentHash: fakeHash,
    satoshis: params.satoshis,
  };
}

// TODO once a real Blink account exists: verify the `svix-id` / `svix-timestamp` /
// `svix-signature` headers against dev.blink.sv's webhook docs before trusting a payload.
export function verifyWebhookSignature(): boolean {
  throw new Error("verifyWebhookSignature: not implemented — see the TODO above this function");
}

// Rough USD->sats conversion for checkout. Swap for a real price feed (e.g. the same
// frankfurter.app-style approach or a dedicated BTC price API) before going live — a hardcoded
// rate will drift and either overcharge or undercharge customers.
const MOCK_BTC_USD_RATE = 65000;
export function usdToSats(usd: number): number {
  return Math.round((usd / MOCK_BTC_USD_RATE) * 100_000_000);
}
