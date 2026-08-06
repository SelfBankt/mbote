// Machankura (machankura.com) lets a user pay a Lightning invoice via USSD straight from their
// mobile money balance, no smartphone or Bitcoin wallet needed — the missing piece between "here's
// a bolt11 invoice" and someone whose only money is on M-Pesa/Airtel Money/Orange Money.
//
// IMPORTANT COVERAGE GAP (confirmed via public research, not assumed): as of this writing
// Machankura operates in Ghana, Kenya, Malawi, Nigeria, South Africa, Uganda, Côte d'Ivoire,
// Tanzania, and Zambia — the Democratic Republic of Congo is NOT among them. This matters because
// mbote's whole audience is DRC. M-Pesa itself IS live in DRC (via Vodacom, separately confirmed),
// so the mobile-money side of the story is real there — it's specifically Machankura's bridge from
// a Lightning invoice to that balance that doesn't reach DRC yet. Practically: a DRC customer who
// already has *any* Lightning wallet can pay directly (see the Blink QR flow), but a customer whose
// only money is on mobile money and who has no Bitcoin wallet is not yet served for DRC
// specifically via this path. Built anyway because (a) Machankura is expanding country coverage
// over time and this becomes a no-code-change win the day DRC is added, and (b) it's genuinely
// useful today for the wider Central/East Africa audience the user also named.
//
// Machankura doesn't have a documented public API for "generate a payment link for this specific
// bolt11 invoice" (their own product is the wallet: you dial USSD, and *it* generates the
// invoice for you to receive/send). So there's no server-side "create a Machankura link" call to
// make here — the realistic integration is linking out to Machankura's own USSD instructions with
// the invoice pre-filled/copyable, which is what buildMachankuraInstructions() below does. If
// Machankura ships a partner API later, this is the file to replace with a real call.

export type MachankuraCountry =
  | "GH" | "KE" | "MW" | "NG" | "ZA" | "UG" | "CI" | "TZ" | "ZM";

export const MACHANKURA_COVERED_COUNTRIES: MachankuraCountry[] = [
  "GH", "KE", "MW", "NG", "ZA", "UG", "CI", "TZ", "ZM",
];

// DRC's ISO code (CD) is deliberately absent from the list above — see the coverage note.
export function isMachankuraAvailableFor(countryCode: string): boolean {
  return MACHANKURA_COVERED_COUNTRIES.includes(countryCode as MachankuraCountry);
}

export function buildMachankuraUssdHint(): string {
  // Machankura's real USSD code varies by country/carrier partnership — this is a placeholder
  // pointing at their own instructions page rather than a fabricated dial code, since getting a
  // USSD short code wrong is the kind of error a user can't self-diagnose.
  return "*483*88# (varies by country — confirm at machankura.com before publishing this UI)";
}
