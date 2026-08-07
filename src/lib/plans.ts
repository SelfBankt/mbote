// Placeholder eSIM plan data — see CLAUDE.md "eSIM fulfillment (Maya Mobile)". The shape here
// mirrors what Maya Mobile's Connect+ API is documented to return (plan id, network, data
// allowance, validity, USD price) so swapping getPlans() for a real `fetch()` call against their
// API later is a drop-in change, not a redesign. Confirmed via public research (not the API docs
// directly, which require a partner account): Maya Mobile covers DRC via Vodacom + Orange LTE,
// plans from $4.99 — the two cheapest plans below match that starting price deliberately.
export type Network = "Vodacom" | "Orange" | "Airtel";

// Official network logos, sourced from Wikimedia Commons (public-domain-licensed uploads,
// individually confirmed as the correct current logo before use — see CLAUDE.md "Network logos"
// for the exact source files and the reasoning behind using them at all). Displayed small and
// neutrally, purely to identify which network a plan runs on — not styled as an endorsement, and
// not implying any confirmed partnership with these carriers (Maya Mobile onboarding, which would
// normally clarify official brand-asset usage rights, is still pending).
export const NETWORK_LOGOS: Record<Network, string> = {
  Vodacom: "/logos/vodacom.svg",
  Orange: "/logos/orange.svg",
  Airtel: "/logos/airtel.svg",
};

export type EsimPlan = {
  id: string;
  countryCode: "CD"; // ISO 3166-1 alpha-2 — Democratic Republic of the Congo
  network: Network;
  dataAmountMb: number; // null-free: use Infinity to represent "unlimited"
  validityDays: number;
  priceUsd: number;
};

const PLANS: EsimPlan[] = [
  { id: "cd-vodacom-1gb-7d", countryCode: "CD", network: "Vodacom", dataAmountMb: 1024, validityDays: 7, priceUsd: 4.99 },
  { id: "cd-orange-1gb-7d", countryCode: "CD", network: "Orange", dataAmountMb: 1024, validityDays: 7, priceUsd: 4.99 },
  { id: "cd-vodacom-3gb-15d", countryCode: "CD", network: "Vodacom", dataAmountMb: 3072, validityDays: 15, priceUsd: 11.99 },
  { id: "cd-orange-3gb-15d", countryCode: "CD", network: "Orange", dataAmountMb: 3072, validityDays: 15, priceUsd: 11.99 },
  { id: "cd-vodacom-5gb-30d", countryCode: "CD", network: "Vodacom", dataAmountMb: 5120, validityDays: 30, priceUsd: 18.99 },
  { id: "cd-orange-5gb-30d", countryCode: "CD", network: "Orange", dataAmountMb: 5120, validityDays: 30, priceUsd: 18.99 },
  { id: "cd-vodacom-10gb-30d", countryCode: "CD", network: "Vodacom", dataAmountMb: 10240, validityDays: 30, priceUsd: 32.99 },
  { id: "cd-airtel-2gb-15d", countryCode: "CD", network: "Airtel", dataAmountMb: 2048, validityDays: 15, priceUsd: 9.99 },
];

export async function getPlans(): Promise<EsimPlan[]> {
  // async to match the shape of a future real API call (fetch from Maya Mobile) without
  // requiring callers to change
  return PLANS;
}

export async function getPlan(id: string): Promise<EsimPlan | undefined> {
  return PLANS.find((p) => p.id === id);
}

export function formatData(dataAmountMb: number): string {
  if (dataAmountMb >= 1024) return `${dataAmountMb / 1024} GB`;
  return `${dataAmountMb} MB`;
}

// Shared by both plans (eSIM) and topups pages — not locale-specific, same convention as
// formatData() always rendering "GB"/"MB" literally regardless of locale.
export function formatPricePerGb(priceUsd: number, dataAmountMb: number): string {
  const gb = dataAmountMb / 1024;
  if (!gb || !Number.isFinite(gb)) return "";
  return `$${(priceUsd / gb).toFixed(2)}/GB`;
}

// Formats a USD price as its CDF (Congolese Franc) equivalent for display — takes the
// already-converted amount rather than a rate, so it stays independent of where the USD->CDF rate
// comes from (see getUsdToCdfRate() in lib/fx.ts). No decimals: CDF prices aren't shown with
// centimes in everyday DRC pricing. Not locale-specific, same convention as formatData()/
// formatPricePerGb() always rendering their units literally regardless of locale.
export function formatCdf(priceUsd: number, usdToCdfRate: number): string {
  return `${Math.round(priceUsd * usdToCdfRate).toLocaleString("en-US")} FC`;
}
