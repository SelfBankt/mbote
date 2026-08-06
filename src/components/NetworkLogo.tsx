import { NETWORK_LOGOS, type Network } from "@/lib/plans";

// Plain <img>, not next/image: these are small local static SVGs (a few KB each) — the
// optimizer doesn't add value here and would need SVG-specific config for no real benefit.
export function NetworkLogo({ network, className }: { network: Network; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={NETWORK_LOGOS[network]} alt={`${network} logo`} className={className} />
  );
}
