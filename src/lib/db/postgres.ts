import postgres from "postgres";
import type { Order, NewOrder, OrderStore } from "./types";

// Production backend — Postgres via the `postgres` (postgres.js) client, using DATABASE_URL. This
// is exactly the env var name Vercel's Neon integration sets automatically once Postgres storage
// is added to the project (Settings > Storage), so no extra configuration is needed beyond
// provisioning it there. Uses the *pooled* connection string Vercel/Neon provide — serverless
// functions open/close connections far more often than a long-running server would, and the
// pooler is what keeps that from exhausting Postgres's connection limit.
//
// `types.bigint` override: confirmed by testing against a real database that postgres.js returns
// BIGINT columns (amount_sats, created_at, paid_at, fulfilled_at) as JS strings by default, to
// avoid silent precision loss for values outside Number.MAX_SAFE_INTEGER. Every value actually
// stored here (millisecond epoch timestamps, satoshi amounts for eSIM-sized purchases) is safely
// within that range, and Order/NewOrder (types.ts) type these fields as `number` — without this
// override the runtime type wouldn't match the declared type, silently, only on the Postgres
// backend (the SQLite backend returns real numbers), which would be exactly the kind of bug that
// only shows up in production.
const sql = postgres(process.env.DATABASE_URL as string, {
  ssl: "require",
  types: {
    bigint: {
      to: 20,
      from: [20],
      serialize: (x: number) => String(x),
      parse: (x: string) => Number(x),
    },
  },
});

// Same schema as the SQLite backend (see sqlite.ts), translated to Postgres types. Running this
// idempotently on cold start rather than a separate migration step — fine at this app's current
// size/single-table scope; revisit with a real migration tool if the schema grows.
const ready = (async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      product_type TEXT NOT NULL DEFAULT 'esim',
      contact TEXT NOT NULL,
      recipient_phone TEXT,
      locale TEXT NOT NULL,
      price_usd DOUBLE PRECISION NOT NULL,
      amount_sats BIGINT,
      status TEXT NOT NULL DEFAULT 'pending',
      lightning_invoice TEXT,
      blink_payment_hash TEXT,
      esim_reference TEXT,
      topup_reference TEXT,
      created_at BIGINT NOT NULL,
      paid_at BIGINT,
      fulfilled_at BIGINT
    )
  `;
  // CREATE TABLE IF NOT EXISTS above only covers a fresh database — the live production orders
  // table already existed before product_type/recipient_phone/topup_reference were introduced.
  // Postgres supports ADD COLUMN IF NOT EXISTS directly, so this is safe to run unconditionally
  // on every cold start.
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'esim'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_phone TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS topup_reference TEXT`;
})();

export const postgresStore: OrderStore = {
  async createOrder(order: NewOrder) {
    await ready;
    await sql`
      INSERT INTO orders (id, plan_id, product_type, contact, recipient_phone, locale, price_usd, amount_sats, lightning_invoice, blink_payment_hash, created_at)
      VALUES (${order.id}, ${order.plan_id}, ${order.product_type}, ${order.contact}, ${order.recipient_phone}, ${order.locale}, ${order.price_usd}, ${order.amount_sats}, ${order.lightning_invoice}, ${order.blink_payment_hash}, ${Date.now()})
    `;
  },

  async getOrder(id: string) {
    await ready;
    const rows = await sql<Order[]>`SELECT * FROM orders WHERE id = ${id}`;
    return rows[0];
  },

  async getOrderByPaymentHash(paymentHash: string) {
    await ready;
    const rows = await sql<Order[]>`SELECT * FROM orders WHERE blink_payment_hash = ${paymentHash}`;
    return rows[0];
  },

  async markOrderPaid(id: string) {
    await ready;
    await sql`UPDATE orders SET status = 'paid', paid_at = ${Date.now()} WHERE id = ${id} AND status = 'pending'`;
  },

  async markOrderFulfilled(id: string, reference: { esimReference?: string; topupReference?: string }) {
    await ready;
    await sql`
      UPDATE orders SET
        status = 'fulfilled',
        fulfilled_at = ${Date.now()},
        esim_reference = COALESCE(${reference.esimReference ?? null}, esim_reference),
        topup_reference = COALESCE(${reference.topupReference ?? null}, topup_reference)
      WHERE id = ${id}
    `;
  },

  async markOrderExpired(id: string) {
    await ready;
    await sql`UPDATE orders SET status = 'expired' WHERE id = ${id} AND status = 'pending'`;
  },
};
