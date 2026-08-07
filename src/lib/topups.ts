// Data top-up catalog — see CLAUDE.md "Data top-ups (Reloadly + DingConnect)". Unlike
// src/lib/plans.ts (a new eSIM), these top up data directly onto a phone number that already has
// an active SIM on the given DRC network — no installation step.
//
// Built LIVE from two providers (not hand-copied), confirmed against real production accounts
// (2026-08-07):
//   - Reloadly (src/lib/reloadly.ts): Vodacom only, USD wholesale pricing.
//   - DingConnect (src/lib/dingconnect.ts): Vodacom + Airtel, GBP wholesale pricing converted to
//     USD via src/lib/fx.ts.
// Orange has no confirmed data product on EITHER provider for DRC — kept as a single
// `available: false` ("coming soon") entry, same "real, confirmed gap" treatment as the
// Machankura DRC gap (src/lib/machankura.ts).
//
// Both providers return free-text product descriptions rather than structured GB/validity fields,
// so this file parses them defensively:
//   - `parseDataAmountMb` requires an explicit "NN GB"/"NN MB" match — products with no parseable
//     data amount (e.g. Vodacom voice-only bundles like "45mins Vodacom Call", which DingConnect
//     still tags with the "Data" benefit) are silently dropped rather than guessed at.
//   - `parseValidityDays` cross-checks DingConnect's structured `ValidityPeriodIso` field against
//     any explicit day/hour count in the display text. These DISAGREE for most of DingConnect's
//     Airtel (AICD) products as of this writing (e.g. "400MB - 7J (7 Days)" carries
//     ValidityPeriodIso "P1D") — a real data-quality issue in that provider's catalog, not a
//     parsing bug. Rather than guess which source is right, conflicting products are excluded
//     entirely. This is why Airtel's live catalog ends up much thinner than its raw 8-SKU count.
//   - Time-restricted "night bundle" products (Reloadly has two for Vodacom) are excluded outright
//     — their validity period is accurate but the data is only usable in a restricted overnight
//     window, which this catalog's plain dataAmountMb/validityDays shape can't represent honestly.
//   - Combo bundles that mix data with bonus minutes/SMS (DingConnect's Vodacom catalog has several,
//     e.g. "3GB + 450Min All Call") are excluded too — this is framed site-wide as a pure "data
//     top-up" product, and ranking these by $/GB alone would make them look like terrible value when
//     really they bundle in extra value the data-only comparison can't represent. Detected by a "+"
//     in the display text, which reliably separates every combo from every pure-data product in both
//     providers' live catalogs as of this writing.
//
// Pricing: customer-facing priceUsd = wholesaleUsd * 1.10 (10% markup, business decision,
// 2026-08-07 — same figure originally set for Reloadly-only, now applied uniformly to DingConnect
// products too since no separate figure was given). Catalog is sorted by $/GB ascending (best
// value first) per 2026-08-07 request. Fetched live and cached in memory for a short TTL — see
// CACHE_TTL_MS — rather than hand-maintained, since both providers' real SKU lists/prices can
// change over time and a stale hardcoded copy would silently drift from what's actually sellable.
import { NETWORK_LOGOS, type Network } from "@/lib/plans";
import * as reloadly from "@/lib/reloadly";
import * as dingconnect from "@/lib/dingconnect";

export { NETWORK_LOGOS };
export type { Network };

export type TopupProvider = "reloadly" | "dingconnect";

export type DataTopup = {
  id: string;
  countryCode: "CD";
  network: Network;
  provider: TopupProvider;
  available: boolean;
  dataAmountMb: number;
  validityDays: number;
  priceUsd: number; // customer-facing, wholesale + markup
  // Exactly what's needed to fulfill via the given provider — see confirmAndFulfillOrder() in
  // src/lib/orders.ts. Meaningless placeholders on `available: false` entries.
  reloadlyOperatorId: number;
  reloadlyWholesaleUsd: number;
  dingconnectSkuCode: string;
  dingconnectSendValue: number;
  dingconnectSendCurrencyIso: string;
};

const MARKUP = 1.1;

const ORANGE_COMING_SOON: DataTopup = {
  id: "cd-orange-topup-comingsoon",
  countryCode: "CD",
  network: "Orange",
  provider: "reloadly",
  available: false,
  dataAmountMb: 0,
  validityDays: 0,
  priceUsd: 0,
  reloadlyOperatorId: 0,
  reloadlyWholesaleUsd: 0,
  dingconnectSkuCode: "",
  dingconnectSendValue: 0,
  dingconnectSendCurrencyIso: "",
};

const DATA_AMOUNT_RE = /(\d+(?:\.\d+)?)\s*(GB|MB)\b/i;
function parseDataAmountMb(displayText: string): number | null {
  const m = DATA_AMOUNT_RE.exec(displayText);
  if (!m) return null;
  const value = parseFloat(m[1]);
  return m[2].toUpperCase() === "GB" ? value * 1024 : value;
}

const DAYS_TEXT_RE = /\((\d+)\s*Days?\)/i;
const HOURS_TEXT_RE = /\((\d+)\s*(?:Hours?|Hrs)\)/i;
const HOURS_SUFFIX_RE = /-(\d+)H\b/i;
const ISO_DAYS_RE = /^P(\d+)D$/;

function parseTextDays(displayText: string): number | null {
  const daysMatch = DAYS_TEXT_RE.exec(displayText);
  if (daysMatch) return parseInt(daysMatch[1], 10);
  const hoursMatch = HOURS_TEXT_RE.exec(displayText) ?? HOURS_SUFFIX_RE.exec(displayText);
  if (hoursMatch) return parseInt(hoursMatch[1], 10) / 24;
  return null;
}

// Returns null (exclude the product) if the structured ISO duration and the display text disagree
// on the day count — see the file header comment for why that happens and why we don't guess.
function parseValidityDays(validityPeriodIso: string, displayText: string): number | null {
  const isoMatch = ISO_DAYS_RE.exec(validityPeriodIso || "");
  const isoDays = isoMatch ? parseInt(isoMatch[1], 10) : null;
  const textDays = parseTextDays(displayText);
  if (isoDays !== null && textDays !== null && Math.abs(isoDays - textDays) > 0.01) {
    return null;
  }
  return isoDays ?? textDays ?? null;
}

function isComboOrNightBundle(displayText: string): boolean {
  return /night/i.test(displayText) || displayText.includes("+");
}

function buildFromReloadly(products: reloadly.ReloadlyDataProduct[]): DataTopup[] {
  const results: DataTopup[] = [];
  for (const p of products) {
    if (isComboOrNightBundle(p.displayText)) continue; // see file header
    const dataAmountMb = parseDataAmountMb(p.displayText);
    const validityDays = parseValidityDays("", p.displayText);
    if (dataAmountMb === null || validityDays === null || validityDays <= 0) continue;

    results.push({
      id: `cd-reloadly-${p.network.toLowerCase()}-${Math.round(p.wholesaleUsd * 100)}`,
      countryCode: "CD",
      network: p.network,
      provider: "reloadly",
      available: true,
      dataAmountMb,
      validityDays,
      priceUsd: Math.round(p.wholesaleUsd * MARKUP * 100) / 100,
      reloadlyOperatorId: p.operatorId,
      reloadlyWholesaleUsd: p.wholesaleUsd,
      dingconnectSkuCode: "",
      dingconnectSendValue: 0,
      dingconnectSendCurrencyIso: "",
    });
  }
  return results;
}

function buildFromDingConnect(products: dingconnect.DingConnectDataProduct[]): DataTopup[] {
  const results: DataTopup[] = [];
  for (const p of products) {
    if (isComboOrNightBundle(p.displayText)) continue;
    const dataAmountMb = parseDataAmountMb(p.displayText);
    const validityDays = parseValidityDays(p.validityPeriodIso, p.displayText);
    if (dataAmountMb === null || validityDays === null || validityDays <= 0) continue;

    results.push({
      id: `cd-dingconnect-${p.skuCode.toLowerCase()}`,
      countryCode: "CD",
      network: p.network,
      provider: "dingconnect",
      available: true,
      dataAmountMb,
      validityDays,
      priceUsd: Math.round(p.wholesaleUsd * MARKUP * 100) / 100,
      reloadlyOperatorId: 0,
      reloadlyWholesaleUsd: 0,
      dingconnectSkuCode: p.skuCode,
      dingconnectSendValue: p.wholesaleSendValue,
      dingconnectSendCurrencyIso: p.wholesaleSendCurrencyIso,
    });
  }
  return results;
}

function pricePerGb(t: DataTopup): number {
  return t.priceUsd / (t.dataAmountMb / 1024);
}

let cache: { data: DataTopup[]; expiresAt: number } | null = null;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function buildCatalog(): Promise<DataTopup[]> {
  const [reloadlyProducts, dingconnectProducts] = await Promise.all([
    reloadly.getDrcDataProducts().catch((err) => {
      console.error("Reloadly getDrcDataProducts failed, omitting from catalog:", err);
      return [] as reloadly.ReloadlyDataProduct[];
    }),
    dingconnect.getDrcDataProducts().catch((err) => {
      console.error("DingConnect getDrcDataProducts failed, omitting from catalog:", err);
      return [] as dingconnect.DingConnectDataProduct[];
    }),
  ]);

  const available = [
    ...buildFromReloadly(reloadlyProducts),
    ...buildFromDingConnect(dingconnectProducts),
  ].sort((a, b) => pricePerGb(a) - pricePerGb(b));

  return [...available, ORANGE_COMING_SOON];
}

export async function getTopups(): Promise<DataTopup[]> {
  if (cache && cache.expiresAt > Date.now()) return cache.data;
  const data = await buildCatalog();
  cache = { data, expiresAt: Date.now() + CACHE_TTL_MS };
  return data;
}

export async function getTopup(id: string): Promise<DataTopup | undefined> {
  const topups = await getTopups();
  return topups.find((t) => t.id === id);
}
