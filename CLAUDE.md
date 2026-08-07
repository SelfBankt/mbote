# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**mbote** ("hello" in Lingala) is an eSIM price-comparison and sales site for the Democratic Republic of Congo, aimed at the Lingala-speaking population of Central Africa. Customers browse eSIM data plans, then pay with a Bitcoin Lightning wallet or, via a mobile-money-to-Lightning bridge, straight from their M-Pesa/mobile money balance — no bank card, no smartphone Lightning literacy required.

Stack: Next.js 16 (App Router, TypeScript), Tailwind v4, `next-intl` for i18n (Lingala/French/English), SQLite (local dev) / Postgres (production, via Vercel's Neon integration) for order storage — see "Order flow and storage" below for how the two are picked. No ORM, no auth system — there's nothing here that needs user accounts yet.

## Running it

```
npm install
npm run dev
```

Opens at `http://localhost:3000`, redirects to `/ln` (the default locale) or whatever locale your browser's `Accept-Language` header prefers. No environment variables are required to run it — see "Mock mode" below.

## Mock mode (no real API keys needed)

`BLINK_API_KEY`/`BLINK_WALLET_ID` (Lightning invoices) and `MAYA_API_KEY` (eSIM fulfillment) are all unset by default. With them unset, `src/lib/blink.ts` and `src/lib/maya.ts` fall back to mock implementations: a fake-but-plausible-looking invoice is generated, the order is auto-marked "paid" ~6 seconds later (see the `setTimeout` in `POST /api/orders`), and a fake eSIM activation code is generated. This means the **entire flow — browse, compare, buy, pay, "receive" an eSIM — works end to end with zero external accounts**, which is what to use for building/demoing UI changes. Copy `.env.local.example` to `.env.local` and fill in real credentials once real accounts exist; nothing else needs to change, since both files check `isBlinkConfigured()`/`isMayaConfigured()` and switch behavior automatically.

## Architecture

### Next.js 16 — this is not the Next.js you know

This project was scaffolded on Next.js 16.3.0, which has real breaking changes from earlier versions. Two that matter most for working in this repo:

- **`middleware.ts` is deprecated and renamed to `proxy.ts`.** The file lives at `src/proxy.ts`, exports a `proxy` function (not `middleware`), and there's no other structural difference — `next-intl`'s `createMiddleware()` still works unchanged, it's just exported under the new name. Do not create a `middleware.ts` file; Next 16 won't run it.
- **Route `params` are always a `Promise`**, in pages, layouts, and route handlers alike — `await params` (or `await ctx.params` in route handlers) everywhere. Use the globally-available typed helpers `PageProps<'/route'>`, `LayoutProps<'/route'>`, `RouteContext<'/route'>` instead of hand-writing param types — they're generated from the actual file structure by `next dev`/`next build`/`next typegen`, so after adding or renaming a route, run `npx next typegen` (or just start the dev server) before TypeScript will recognize the new route string.

If something in `node_modules/next/dist/docs/` disagrees with training-data knowledge of "how Next.js works," trust the docs in that folder — that's the actual guidance this version's own `AGENTS.md` points at.

### Internationalization (Lingala / French / English)

`src/i18n/routing.ts` defines the three locales via `next-intl`'s `defineRouting`, with **Lingala as the default** (`localePrefix: "always"` — every URL is prefixed, e.g. `/ln`, `/fr`, `/en`, there's no unprefixed default). `src/proxy.ts` runs `next-intl`'s locale-negotiation on every non-API, non-asset request. Translated strings live in `src/messages/{ln,fr,en}.json`, one flat-ish nested JSON per locale, same key structure across all three.

**The Lingala copy needs native-speaker review before this goes anywhere real.** It's a good-faith, vocabulary-conscious effort (and leans on French loanwords for technical terms like "réseau"/"données," which is realistic — code-switching with French for modern/technical vocabulary is genuinely how Lingala is spoken in DRC) but it was not written or checked by a native speaker. Treat it the same way the French/English copy would be treated if written by a fluent-but-not-native speaker: probably fine, worth a real review pass, don't assume it's flawless.

Routing/links use `next-intl`'s typed navigation (`src/i18n/navigation.ts` — `Link`/`redirect`/`usePathname`/`useRouter`), which automatically prefixes hrefs with the current locale. **No `pathnames` config is set up** (i.e. no per-locale URL translation like `/plans` → `/forfaits` in French) — that's a deliberate scope cut, not an oversight; add a `pathnames` map to `routing.ts` if localized URLs become worth the complexity. Because of that, dynamic route hrefs are plain interpolated strings (`` `/plans/${plan.id}` ``), not the `{ pathname, params }` object shorthand — that shorthand only type-checks when a `pathnames` config exists.

### eSIM plan data (placeholder, shaped for a real API swap)

`src/lib/plans.ts` exports a hardcoded array of DRC eSIM plans and an async `getPlans()`/`getPlan(id)` — async on purpose, so swapping the body for a real `fetch()` call later doesn't change any caller. The shape (network, data amount, validity, USD price) mirrors what Maya Mobile's Connect+ API is documented to return.

### Branding (MboteData logo)

`public/brand/logo.png` — the site wordmark (orange signal-bars icon + "MboteData" text), used in `Header.tsx` in place of the earlier 📶-emoji-plus-text placeholder. User-supplied (2026-08-06), not generated or sourced by an agent. `src/app/icon.png`, `apple-icon.png`, and `favicon.ico` are all cropped/derived from the same source file (the icon mark cropped out and rendered at multiple sizes) — Next's file-based metadata convention picks these up automatically, no manual `<link>` tags needed. If the logo is ever updated, regenerate all four files from the new source rather than editing just `logo.png`, or the browser tab icon and the header will drift out of sync.

### Network logos

`public/logos/{vodacom,orange,airtel}.svg` — real carrier logos, rendered via `src/components/NetworkLogo.tsx` on `/plans` and `/plans/[id]` (`NETWORK_LOGOS` map in `plans.ts`). Sourced from Wikimedia Commons (2026-08-06), each individually verified by rendering before use, not assumed correct from filename alone:

- Vodacom: `Logo_of_Vodacom_Group_Limited_(old).svg` (despite the "(old)" filename, this is the correct current wordmark on inspection)
- Orange: `Orange_logo.svg`
- Airtel: `Airtel_logo.svg` (the generic red wordmark used in-market, not the `Airtel_Africa_logo.svg` corporate-holding variant)

All three are Commons-hosted as public-domain file uploads but remain live trademarks of their respective owners — displayed small and neutrally (informational "which network does this run on" use, not styled as an endorsement), with an explicit "Network logos are trademarks of their respective owners" line in the plan page's terms section. **There is no confirmed reseller/partnership agreement with any of these carriers** — that depends on Maya Mobile onboarding (still pending, see "eSIM fulfillment" below), which would normally also clarify official brand-asset usage rights. Revisit this section once that's confirmed: Maya Mobile may provide licensed logo assets and usage guidelines that supersede this Commons-sourced approach.

### Payment: Blink (Lightning) + Machankura (mobile money bridge)

`src/lib/blink.ts` talks to [Blink](https://blink.sv)'s GraphQL API (`api.blink.sv/graphql`, `X-API-KEY` header) to create Lightning invoices via the `lnInvoiceCreate` mutation — confirmed working against the real API, not just documented (created a genuine invoice through the app's own code path during development). Payment confirmation arrives via Blink webhooks (`receive.lightning` event, delivered through Svix) at `POST /api/webhooks/blink`.

**Webhook signature verification is implemented** (`verifyWebhookSignature()` in `blink.ts`, using the official `svix` npm package rather than hand-rolled HMAC comparison) and covered by the route handler in `src/app/api/webhooks/blink/route.ts`, which reads the raw request body (not a parsed/re-serialized one — signature verification is over exact bytes) and checks the `svix-id`/`svix-timestamp`/`svix-signature` headers before trusting anything in the payload. Confirmed working end-to-end with a locally-generated test secret: a validly-signed payload is accepted (200), a tampered signature is rejected (401), and missing headers are rejected (400).

`BLINK_WEBHOOK_SECRET` can only be obtained by registering this endpoint's *public* URL in the Blink Dashboard's Callback Endpoints page, so it can't be set up from local dev — only after a real deployment exists. **Confirmed working end-to-end on the real production deployment** (mbotedata.com): registered the endpoint via the `callbackEndpointAdd` mutation, obtained the real signing secret from the Dashboard, set it on Vercel, and verified both accept (valid signature → 200) and reject (tampered signature → 401) paths against the live URL. Until `BLINK_WEBHOOK_SECRET` is set, `verifyWebhookSignature()` throws rather than silently accepting unverified payloads — the endpoint fails closed, not open.

`src/lib/machankura.ts` is the mobile-money bridge — a customer with no Bitcoin wallet, only a mobile money balance, pays the same Lightning invoice via USSD through [Machankura](https://machankura.com). **Important, confirmed gap: Machankura does not currently operate in DRC.** As of this build it covers Ghana, Kenya, Malawi, Nigeria, South Africa, Uganda, Côte d'Ivoire, Tanzania, and Zambia — DRC isn't among them, despite M-Pesa itself being confirmed live in DRC via Vodacom. Practically: a DRC customer with *any* Lightning wallet can already pay directly via the QR code; it's specifically customers with *only* a mobile-money balance and no Bitcoin wallet who aren't served via this path in DRC yet. The Machankura section is still built and shown, because (a) it's a no-code-change win the day Machankura adds DRC, and (b) it's already useful today for the wider Central/East African audience. Don't quietly drop this caveat if extending the Machankura integration — it's a real product gap, not a bug.

There is no real USD→sats price feed (`usdToSats()` in `blink.ts` uses a hardcoded rate) — swap for a real BTC price API before real money is involved, or customers will be over/undercharged as the rate drifts.

### eSIM fulfillment: Maya Mobile

`src/lib/maya.ts` — once payment is confirmed, this is meant to call Maya Mobile's Connect+ API to actually provision the eSIM and get back an LPA activation code / QR. **Maya Mobile's full API reference is NDA'd to onboarded partners** — the request/response shapes here (`CreateEsimRequest { plan_id, region, country }`) come from what's publicly indexed, not a confirmed contract. Reconcile field names against the real partner docs the moment a Maya Mobile account exists.

Why Maya Mobile specifically: researched against several eSIM wholesale/API platforms for DRC coverage specifically (not just "how many countries globally," which is a misleading metric — several big aggregators with ~100-country coverage don't include DRC at all). Confirmed: **Maya Mobile covers DRC via Vodacom + Orange LTE**, has a documented developer API and white-label reseller program. MobiMatter also confirmed DRC coverage (marketplace model, cheaper starting price) and is worth keeping as a second option. eSIM Access was ruled out — easy self-serve API signup, but DRC isn't in their ~100-country list.

### Data top-ups (Reloadly + DingConnect)

A second, parallel offering alongside the eSIM plans above: adds data directly onto a phone number
that **already has an active SIM** on a DRC network — no eSIM, no QR code, no LPA activation code.
The customer supplies their existing phone number instead of an eSIM-compatible-device contact,
and a successful provider API call is the entire fulfillment (see the `"topup"` branch of
`confirmAndFulfillOrder()` in `src/lib/orders.ts`).

Two providers, confirmed against real production accounts (2026-08-07):

- **Reloadly** (`src/lib/reloadly.ts`) — Vodacom only (`operatorId` 1326, "Vodacom DRC Data").
  Orange and Airtel DRC only expose generic RANGE-type airtime on Reloadly, no data product. Auth
  is OAuth2 client-credentials; one correction worth remembering if this file is touched again —
  the token host is `auth.reloadly.com`, NOT `accounts.reloadly.com` (an easy wrong guess, the
  latter doesn't resolve). Wholesale prices are already USD.
- **DingConnect** (`src/lib/dingconnect.ts`) — Vodacom AND Airtel (`GET /api/V1/GetProducts` with
  `Benefits=Data`, confirmed via `GetProviders`: `ProviderCode` `VDCD`=Vodacom, `AICD`=Airtel;
  `ORCD`=Orange and `AFCD`=Africell exist as DRC providers but have no product tagged with the
  `Data` benefit). Auth is a single `api_key` header. DingConnect's own docs/help-center site is
  behind a Cloudflare bot challenge that blocks non-browser fetches — the request/response shapes
  here come from a third-party open-source PHP client's generated docs
  (`github.com/parenthesislab/dingconnect-api-php`), cross-checked against real live responses,
  not the (inaccessible) official reference. Wholesale prices are quoted in **GBP** (the agent
  account's billing currency) against a USD `ReceiveValue` — converted to USD via
  `src/lib/fx.ts` (Frankfurter/ECB rates, no API key, cached 30 min, hardcoded fallback if the
  fetch fails) before being comparable to Reloadly's USD wholesale prices.

**`src/lib/topups.ts` fetches both providers' catalogs LIVE** (not a hand-copied static list) and
merges them, cached in memory for 10 minutes. This is a deliberate departure from `plans.ts`'s
fully-static approach — real SKU lists/prices from both providers can change over time, and copying
them by hand would silently drift from what's actually sellable. Both providers only return
free-text product descriptions (no structured GB/validity fields), so `topups.ts` parses them
defensively and **excludes rather than guesses** whenever something doesn't check out:
- No parseable "NN GB"/"NN MB" in the description → excluded (drops voice-only bundles that
  DingConnect still tags with the `Data` benefit, e.g. "45mins Vodacom Call").
- DingConnect's structured `ValidityPeriodIso` disagreeing with an explicit day/hour count in the
  description text → excluded. This turned out to be a **real, widespread data-quality issue in
  DingConnect's Airtel (AICD) catalog specifically** (e.g. "400MB - 7J (7 Days)" carries
  `ValidityPeriodIso` "P1D") — confirmed by inspecting the raw API response, not a parsing bug.
  Only 3 of Airtel's 8 raw SKUs survive this check as of 2026-08-07.
- Time-restricted "night bundle" products (Reloadly has two for Vodacom, usable only in a
  restricted overnight window) → excluded outright, the plain `dataAmountMb`/`validityDays` shape
  can't represent that honestly.
- Combo bundles mixing data with bonus minutes/SMS (DingConnect's Vodacom catalog has several,
  detected by a `+` in the description, e.g. "3GB + 450Min All Call") → excluded. This is framed
  site-wide as a pure "data top-up" product, and ranking these by $/GB would make them look like
  terrible value when they actually bundle in real extra value the data-only comparison ignores.

Customer price = wholesale × 1.10 (10% markup, business decision, 2026-08-07, applied uniformly to
both providers). **Catalog is sorted by $/GB ascending** (best value first, per 2026-08-07
request) — as of this writing that's ~22 available products spanning both Vodacom (both providers)
and Airtel (DingConnect only). Orange has no confirmed data product on *either* provider — kept as
a single `available: false` ("coming soon") entry, not linked from `/topups`, rejected by
`POST /api/orders` as defense in depth — same "real, confirmed gap, not an oversight" treatment as
the Machankura DRC gap below.

Each `DataTopup` carries exactly what's needed to fulfill via its own provider
(`reloadlyOperatorId`/`reloadlyWholesaleUsd` or `dingconnectSkuCode`/`dingconnectSendValue`/
`dingconnectSendCurrencyIso`) — `confirmAndFulfillOrder()` dispatches on `topup.provider` and pays
the provider its own **wholesale** amount, never the marked-up `priceUsd`. This mattered in
practice: an earlier version of this integration passed the marked-up USD price straight to
Reloadly's `sendTopup()`, which would very likely have failed or misbehaved against a real
FIXED-denomination operator that only accepts one of its own enumerated wholesale amounts — caught
and fixed while wiring up DingConnect, not shipped as-is.

Both `sendTopup()` (Reloadly) and `sendTransfer()` (DingConnect) — the actual, billable top-up
calls — have **not** been exercised against production, only auth + the read-only catalog lookups
have. Confirm a real send works (sandbox first, if available) before relying on either for real
customer orders.

Runs in mock mode exactly like every other integration when the relevant env vars are unset —
`getDrcDataProducts()`/`sendTopup()`/`sendTransfer()` all have mock fallbacks, so the full top-up
flow (browse `/topups`, buy, pay, mock-confirm, mock-fulfill, mock-email) works end to end with
zero real credentials. Production credentials for both providers are in local `.env.local`
(2026-08-07) — DingConnect is **not yet added to Vercel**, so the deployed site's Airtel coverage
and DingConnect's Vodacom SKUs are still mock-mode there until that's done and redeployed. Since
local dev now calls both real APIs, be deliberate about triggering real order fulfillment locally —
override the credential env vars to empty when you specifically want mock mode for a test run.

Order storage: `orders.product_type` (`"esim"` | `"topup"`) disambiguates which catalog `plan_id`
resolves against and which fulfillment path runs; `recipient_phone` holds the number being topped
up; `topup_reference` holds the provider's transaction/transfer id once fulfilled (kept as a
separate column from the eSIM-only `esim_reference` rather than repurposing it, to avoid touching a
column that was already live in production). Both `sqlite.ts` and `postgres.ts` migrate these
columns onto an already-existing `orders` table via `ALTER TABLE` — `CREATE TABLE IF NOT EXISTS`
alone does not retroactively add columns.

### Delivery: email (Resend)

`src/lib/email.ts` — once an order is fulfilled, `confirmAndFulfillOrder()` (`src/lib/orders.ts`) emails the customer the eSIM QR code (as a PNG attachment, generated server-side with the same `qrcode` package used for the checkout Lightning QR) plus the manual LPA activation code, localized to `order.locale` via `next-intl`'s `createTranslator` (not a request-scoped `useTranslations`, since this runs outside any page render — messages are loaded directly by dynamic `import()`, same pattern as `src/i18n/request.ts`).

Uses Resend's HTTP API directly via `fetch`, not the `resend` npm package — a single POST call didn't justify a dependency. `RESEND_API_KEY` unset runs in mock mode (logs what would have been sent, same pattern as Blink/Maya).

`order.contact` can be an email *or* a phone number (see `checkout.contactLabel`) — delivery only fires when it contains `@`; phone-number contacts are silently skipped rather than erroring, since SMS/WhatsApp delivery into DRC isn't built (most mainstream SMS APIs have weak/expensive DRC coverage — worth checking real usage patterns before picking one). Verified end-to-end in mock mode (2026-08-06): all three locales produced correctly-subjected/translated log output, and a phone-number contact correctly produced no email.

**Live in production** (2026-08-06): `RESEND_API_KEY` and `EMAIL_FROM="MboteData <orders@mbotedata.com>"` are set locally and on Vercel. mbotedata.com is verified as a sending domain in the Resend dashboard, confirmed by a real send that succeeded to an address *outside* the Resend account (domain verification lifts Resend's sandbox restriction that otherwise limits the shared `onboarding@resend.dev` sender to the account owner's own address only). Delivery to real customers now works — the only remaining gap is that fulfillment itself (`src/lib/maya.ts`) is still mocked, so the QR/code being emailed isn't a real eSIM yet.

### Order flow and storage

`src/lib/db/` — dual-backend order store, picked automatically by whether `DATABASE_URL` is set (`src/lib/db/index.ts`):

- **Local dev (`DATABASE_URL` unset):** SQLite via `better-sqlite3` (`src/lib/db/sqlite.ts`), one `orders` table, zero-setup. The `data/` directory is gitignored.
- **Production (`DATABASE_URL` set):** Postgres via the `postgres` npm package (`src/lib/db/postgres.ts`), targeting Vercel's Neon integration — add Postgres storage from the Vercel project's Settings > Storage tab and `DATABASE_URL` is injected automatically, no separate Neon account needed. This was necessary before any serverless deployment: a serverless platform's filesystem isn't persistent across invocations, so SQLite writes would silently vanish between requests.

Both backends implement the same `OrderStore` interface (`src/lib/db/types.ts`) with identical async method signatures, so every caller (`src/lib/orders.ts`, the API routes, the checkout page) is written against one consistent API and doesn't know or care which backend is actually active. `db/index.ts` picks between them with a conditional `require()`, not a static `import` — both backends run side-effecting setup at module load (SQLite opens/creates a file, Postgres opens a connection), and a static import would run *both* regardless of which is selected, which would crash immediately on Vercel's read-only filesystem even in a Postgres-only deployment.

Order lifecycle: `pending` → `paid` → `fulfilled` (or `expired`/`failed`). `src/lib/orders.ts`'s `confirmAndFulfillOrder()` is the single funnel both the real webhook path and the mock-mode timeout call through, so fulfillment logic only exists in one place. `POST /api/orders` creates the order + invoice; `GET /api/orders/[id]/status` is polled by the checkout page client component every 2.5s (`src/app/[locale]/checkout/[orderId]/CheckoutClient.tsx`) rather than using a websocket/SSE — simplest thing that works at this scale, revisit if polling load ever matters.

### Route structure

```
src/app/[locale]/              — every user-facing page, locale-prefixed
  page.tsx                     — home
  plans/page.tsx                — comparison listing
  plans/[id]/page.tsx           — plan detail + BuyForm (client component, posts to /api/orders)
  checkout/[orderId]/page.tsx   — server component: loads order, generates QR server-side
  checkout/[orderId]/CheckoutClient.tsx — client component: polls status, renders QR/Machankura/success states
  guides/page.tsx               — French-only SEO content index (see "SEO" below) — 404s outside fr
  guides/[slug]/page.tsx        — individual guide article
src/app/api/                   — NOT locale-prefixed (excluded in proxy.ts's matcher)
  orders/route.ts                — POST: create order + Blink invoice
  orders/[id]/status/route.ts    — GET: poll order status
  webhooks/blink/route.ts        — POST: Blink payment webhook (signature-verified — see above)
```

QR codes are generated **server-side** (`qrcode`'s `toDataURL`, in `checkout/[orderId]/page.tsx`) and passed to the client component as a data URL, rather than shipping the `qrcode` package to the browser — smaller client bundle, and the invoice string never needs a client-side round trip just to render itself.

### SEO

Technical foundation (2026-08-06): `src/app/sitemap.ts` and `robots.ts` (every route × locale, 30 URLs at last count), hreflang `<link>` alternates + Open Graph/Twitter tags + `metadataBase` (root `[locale]/layout.tsx`), per-page `generateMetadata` on `/plans` and `/plans/[id]` (real titles instead of the site default), and JSON-LD (`Organization` sitewide, `Product`/`Offer` on plan pages) via the shared `src/components/JsonLd.tsx`. `src/lib/site.ts` holds the hardcoded `SITE_URL` constant and the `localeAlternates()` helper every hreflang/sitemap entry is built from. Registered and verified in both Google Search Console (HTML-tag method, via a `verification.google` entry in the root layout's metadata — do not remove that field, Google re-checks it) and Bing Webmaster Tools (imported directly from the verified GSC property, no separate verification needed). Sitemap submitted to both; **do not** remove `verification.google` from the layout metadata even after verification succeeds, or ownership is revoked.

`src/lib/guides.ts` + `src/app/[locale]/guides/`: long-tail SEO content, available in all three locales (ln/fr/en). Originally French-only — French carries more DRC search volume than Lingala even among Lingala speakers, and as a brand-new domain with no backlinks yet, long-tail informational queries ("comment installer une eSIM en RDC") are a more realistic path to ranking than competing head-on for "eSIM RDC" — then extended to ln/en on request. This is hand-written article content per locale (`Guide.translations`, keyed by locale), not run through the next-intl message-file pattern the rest of the app uses, since it's prose, not short UI strings. **Same slug across all three locales** (e.g. `/en/guides/comment-installer-esim-rdc` keeps the French slug for the English article) — matches how plan IDs are already unlocalized site-wide (`routing.ts` has no per-locale `pathnames` mapping), but is a real tradeoff: English/Lingala readers get a French URL, which isn't ideal for keyword targeting in those languages. Revisit if English/Lingala organic performance on these pages ever matters enough to justify per-locale slugs. Each guide gets its own `Article` + `FAQPage` JSON-LD per locale (the FAQ content is real Q&A also rendered on-page, not schema-only), full hreflang alternates in the sitemap (same as every other route), and the "Guides" nav link shows on all locales via `nav.guides` in the message files.

## Deployment

Live at **mbotedata.com**, deployed on Vercel (team `mbote1`, project `mbote`), Postgres via the Neon marketplace integration (Project Settings > Storage). Deploying:

```
vercel deploy --prod --token=<a Vercel access token, from vercel.com/account/tokens>
```

The GitHub repo is connected too, so pushes to `main` also trigger a deployment automatically — the CLI deploy above is only needed for things like an env var change that isn't tied to a code push.

**Env vars** are managed via `vercel env add <NAME> production --value="..." [--sensitive]` — **always pass `--value` explicitly rather than letting the CLI read from a `.env.local` line via shell substitution**: `.env.local` values here are double-quoted (`KEY="value"`), and naively extracting them (e.g. `` $(grep ...) ``) captures the literal quote characters into the stored secret, silently breaking auth. Confirmed this exact failure mode once already (`BLINK_API_KEY`/`BLINK_WALLET_ID` had to be removed and re-added after the quotes made it into the stored value) — worth remembering before scripting env var updates again.

**After any env var change, redeploy** (`vercel deploy --prod`) — Vercel serverless functions don't pick up dashboard/CLI env var changes on existing deployments, only on the next build.

`vercel integration add neon` requires accepting Neon's marketplace terms in a browser first (`vercel.com/<team>/~/integrations/accept-terms/neon`) — this is a one-time, human-only step; the CLI returns `action_required` / `integration_terms_acceptance_required` until it's done, then the same `integration add` command completes the install.

## Known limitations

- Lingala copy needs native-speaker review (see i18n section above).
- Machankura doesn't cover DRC yet (see Payment section above) — a real, confirmed gap, not an oversight.
- No real BTC/USD price feed — `usdToSats()` is a hardcoded rate.
- No customer-facing delivery (email/SMS) of the eSIM activation code once fulfilled — it only lands in the database.
- No admin/ops view of orders — checking order status currently means querying Postgres (or the SQLite file in local dev) directly.
- No pagination, search, or filtering on the plans listing (fine at 8 hardcoded plans, won't be once real Maya Mobile data is wired in with potentially hundreds of plans/networks).
- No tests.
- Maya Mobile eSIM fulfillment is still mocked — no real partner account yet (see "eSIM fulfillment" above), so real orders confirm payment correctly but don't provision a real eSIM.
- Reloadly and DingConnect production credentials both exist and are confirmed working for auth + catalog lookups (see "Data top-ups (Reloadly + DingConnect)" above), but the actual billable top-up calls — `sendTopup()` and `sendTransfer()` — have never been exercised for real; confirm each works before relying on them for a real customer order. DingConnect is not yet added to Vercel, so the deployed site's Airtel coverage and DingConnect Vodacom SKUs are still mock-mode there.
- Only Vodacom (both providers) and Airtel (DingConnect only) have real data products for DRC — Orange has none on either provider and is shown as "coming soon," a confirmed gap rather than an oversight (mirrors the Machankura DRC gap).
- No real BTC/USD price feed for `usdToSats()` (see above) — similarly, DingConnect's GBP wholesale prices are converted via a live-but-unpinned FX rate (`src/lib/fx.ts`), not a treasury-grade rate source. Fine for a 10%-margin consumer product, not for anything sensitive to a few basis points.
