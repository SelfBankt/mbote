// Tiny FX helper — currently only needed for DingConnect, which quotes wholesale prices in GBP
// (the agent account's billing currency) against a USD ReceiveValue, whereas every other price in
// this app (eSIM plans, Reloadly top-ups, Lightning invoices) is USD-denominated. Converts GBP
// wholesale costs to USD so DingConnect products can be marked up and sorted ($/GB) on the same
// basis as Reloadly ones.
//
// Uses Frankfurter (frankfurter.app — ECB reference rates, no API key required) rather than a paid
// FX API, since this is a low-stakes "roughly right, refreshed periodically" conversion, not a
// trading system. Cached in memory with a fallback rate if the fetch fails or is unconfigured —
// same "never let one integration's outage break the page" posture as everywhere else in this app.

const FRANKFURTER_URL = "https://api.frankfurter.app/latest?from=GBP&to=USD";

// Fallback only used if the live rate fetch fails — approximate, deliberately not treated as a
// primary source. Update if this drifts noticeably from the live rate over time.
const FALLBACK_GBP_USD_RATE = 1.27;

let cachedRate: { rate: number; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes — FX doesn't move fast enough to justify tighter

export async function getGbpToUsdRate(): Promise<number> {
  if (cachedRate && cachedRate.expiresAt > Date.now()) return cachedRate.rate;

  try {
    const res = await fetch(FRANKFURTER_URL);
    if (!res.ok) throw new Error(`Frankfurter API error: ${res.status}`);
    const data = await res.json();
    const rate = data.rates?.USD;
    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      throw new Error("Frankfurter response missing a usable USD rate");
    }
    cachedRate = { rate, expiresAt: Date.now() + CACHE_TTL_MS };
    return rate;
  } catch (err) {
    console.error("GBP->USD rate fetch failed, using fallback rate:", err);
    return FALLBACK_GBP_USD_RATE;
  }
}

// USD -> CDF (Congolese Franc), used only to render a courtesy second price alongside every
// USD price shown to shoppers (see formatCdf() in lib/plans.ts) — every real money-moving number
// in this app (wholesale cost, checkout charge, Lightning invoice) stays USD-denominated, this is
// purely a "here's roughly what that is in local currency" display conversion.
//
// Frankfurter (used above for GBP->USD) is ECB-based and does not carry CDF at all — confirmed by
// querying it directly. open.er-api.com is used instead: free, no API key, confirmed to return a
// CDF rate.
const OPEN_ER_API_URL = "https://open.er-api.com/v6/latest/USD";

// Fallback only used if the live rate fetch fails — set from a live rate check (2026-08-07), not a
// guess. Update if this drifts noticeably from the live rate over time.
const FALLBACK_USD_CDF_RATE = 2275;

let cachedCdfRate: { rate: number; expiresAt: number } | null = null;

export async function getUsdToCdfRate(): Promise<number> {
  if (cachedCdfRate && cachedCdfRate.expiresAt > Date.now()) return cachedCdfRate.rate;

  try {
    const res = await fetch(OPEN_ER_API_URL);
    if (!res.ok) throw new Error(`open.er-api.com error: ${res.status}`);
    const data = await res.json();
    const rate = data.rates?.CDF;
    if (typeof rate !== "number" || !Number.isFinite(rate)) {
      throw new Error("open.er-api.com response missing a usable CDF rate");
    }
    cachedCdfRate = { rate, expiresAt: Date.now() + CACHE_TTL_MS };
    return rate;
  } catch (err) {
    console.error("USD->CDF rate fetch failed, using fallback rate:", err);
    return FALLBACK_USD_CDF_RATE;
  }
}
