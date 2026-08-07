// Data top-up catalog — see CLAUDE.md "Data top-ups (Reloadly)". Unlike src/lib/plans.ts (a new
// eSIM), these top up data directly onto a phone number that already has an active SIM on the
// given DRC network — no installation step. Shares the Network type / NETWORK_LOGOS map with
// plans.ts rather than duplicating it, since it's the same three carriers either way.
//
// Confirmed against a real Reloadly production account (2026-08-07) via
// `GET https://topups.reloadly.com/operators/countries/CD`: Vodacom is the ONLY DRC network with
// an actual data-bundle product on Reloadly (operatorId 1326, "Vodacom DRC Data") — Orange and
// Airtel DRC only have generic airtime top-up (RANGE denomination, no dedicated data product), so
// there is currently no way to fulfill an Orange/Airtel data top-up through Reloadly. Those two are
// kept in the catalog as `available: false` ("coming soon") rather than removed outright — same
// pattern as the Machankura DRC gap (see src/lib/machankura.ts): a real, confirmed gap, not an
// oversight, and a no-code-change win if Reloadly adds the product later. `available: false`
// entries are not linked to a detail/checkout page (see topups/page.tsx) and are rejected by
// POST /api/orders as a defense-in-depth check.
//
// Vodacom bundle sizes/validity/wholesale prices are the real `fixedAmountsDescriptions` from that
// same operator lookup (see /operators/1326) — not estimates. Customer prices are wholesale + 10%
// markup (business decision, 2026-08-07), rounded to the nearest cent. Two time-restricted "night
// bundle" tiers Reloadly also offers (2GB/24hr and 10GB/24hr, night-only) are deliberately left out
// of this general-purpose catalog.
import { NETWORK_LOGOS, type Network } from "@/lib/plans";

export { NETWORK_LOGOS };
export type { Network };

export type DataTopup = {
  id: string;
  countryCode: "CD";
  network: Network;
  operatorId: number; // Reloadly operator id — meaningless (0) when available is false
  available: boolean; // false = no confirmed Reloadly data product for this network in DRC yet
  dataAmountMb: number;
  validityDays: number;
  priceUsd: number;
};

const VODACOM_DATA_OPERATOR_ID = 1326;

const TOPUPS: DataTopup[] = [
  { id: "cd-vodacom-topup-60mb-3d", countryCode: "CD", network: "Vodacom", operatorId: VODACOM_DATA_OPERATOR_ID, available: true, dataAmountMb: 60, validityDays: 3, priceUsd: 0.12 },
  { id: "cd-vodacom-topup-400mb-3d", countryCode: "CD", network: "Vodacom", operatorId: VODACOM_DATA_OPERATOR_ID, available: true, dataAmountMb: 400, validityDays: 3, priceUsd: 0.5 },
  { id: "cd-vodacom-topup-2gb-2d", countryCode: "CD", network: "Vodacom", operatorId: VODACOM_DATA_OPERATOR_ID, available: true, dataAmountMb: 2048, validityDays: 2, priceUsd: 0.98 },
  { id: "cd-vodacom-topup-4gb-2d", countryCode: "CD", network: "Vodacom", operatorId: VODACOM_DATA_OPERATOR_ID, available: true, dataAmountMb: 4096, validityDays: 2, priceUsd: 1.64 },
  { id: "cd-vodacom-topup-3-6gb-7d", countryCode: "CD", network: "Vodacom", operatorId: VODACOM_DATA_OPERATOR_ID, available: true, dataAmountMb: 3686.4, validityDays: 7, priceUsd: 4.09 },
  { id: "cd-vodacom-topup-13gb-30d", countryCode: "CD", network: "Vodacom", operatorId: VODACOM_DATA_OPERATOR_ID, available: true, dataAmountMb: 13312, validityDays: 30, priceUsd: 8.17 },
  { id: "cd-vodacom-topup-35gb-30d", countryCode: "CD", network: "Vodacom", operatorId: VODACOM_DATA_OPERATOR_ID, available: true, dataAmountMb: 35840, validityDays: 30, priceUsd: 16.36 },
  { id: "cd-vodacom-topup-65gb-30d", countryCode: "CD", network: "Vodacom", operatorId: VODACOM_DATA_OPERATOR_ID, available: true, dataAmountMb: 66560, validityDays: 30, priceUsd: 24.53 },
  { id: "cd-orange-topup-comingsoon", countryCode: "CD", network: "Orange", operatorId: 0, available: false, dataAmountMb: 0, validityDays: 0, priceUsd: 0 },
  { id: "cd-airtel-topup-comingsoon", countryCode: "CD", network: "Airtel", operatorId: 0, available: false, dataAmountMb: 0, validityDays: 0, priceUsd: 0 },
];

export async function getTopups(): Promise<DataTopup[]> {
  // async to match getPlans()'s shape — see plans.ts — so swapping for a real Reloadly catalog
  // call later doesn't change any caller
  return TOPUPS;
}

export async function getTopup(id: string): Promise<DataTopup | undefined> {
  return TOPUPS.find((t) => t.id === id);
}
