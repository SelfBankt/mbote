# mbote

**eSIM data plans for DR Congo — compare, buy, pay with Bitcoin Lightning or mobile money.**

Built for the Lingala-speaking population of Central Africa. Browse and compare eSIM data plans on DRC's Vodacom/Orange/Airtel networks, then pay however's easiest — a Lightning wallet directly, or (where available) straight from an M-Pesa/mobile money balance via a USSD bridge.

- 🇨🇩 Comparison + full checkout, not just a listings board
- ⚡ Bitcoin Lightning payments via [Blink](https://blink.sv)
- 📱 Mobile-money-to-Lightning bridge via [Machankura](https://machankura.com) *(DRC coverage not yet confirmed — see CLAUDE.md)*
- 📶 eSIM fulfillment via [Maya Mobile](https://maya.net)'s Connect+ API
- 🌍 Lingala, French, and English

## Running it

```bash
npm install
npm run dev
```

No API keys required to try the full flow — see [`CLAUDE.md`](./CLAUDE.md#mock-mode-no-real-api-keys-needed) for how mock mode works.

## Documentation

[`CLAUDE.md`](./CLAUDE.md) has the full architecture writeup: routing/i18n setup, the payment and fulfillment integrations (and their current real-world coverage gaps), the Next.js 16 conventions this project relies on, and known limitations.
