import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import type { Order, NewOrder, OrderStore } from "./types";

// Local-dev-only backend — zero-setup, keeps orders across restarts without standing up a hosted
// database before there's anything real to store. NOT used in production (see db/index.ts) — a
// serverless platform's filesystem isn't persistent across invocations, so SQLite writes here
// would silently vanish. Functions are async to match OrderStore even though better-sqlite3 itself
// is synchronous — callers use the same interface regardless of which backend is active.
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, "mbote.sqlite3"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    product_type TEXT NOT NULL DEFAULT 'esim', -- 'esim' (Maya) or 'topup' (Reloadly)
    contact TEXT NOT NULL,
    recipient_phone TEXT, -- topup orders only: the existing DRC number being topped up
    locale TEXT NOT NULL,
    price_usd REAL NOT NULL,
    amount_sats INTEGER,
    status TEXT NOT NULL DEFAULT 'pending', -- pending -> paid -> fulfilled, or -> expired / failed
    lightning_invoice TEXT,
    blink_payment_hash TEXT,
    esim_reference TEXT, -- Maya Mobile order/eSIM id once fulfilled
    topup_reference TEXT, -- Reloadly transaction id once fulfilled
    created_at INTEGER NOT NULL,
    paid_at INTEGER,
    fulfilled_at INTEGER
  );
`);

// CREATE TABLE IF NOT EXISTS above only handles fresh databases — it doesn't add columns to an
// orders table that already existed before product_type/recipient_phone/topup_reference were
// introduced (this file's dev sqlite included). SQLite's ALTER TABLE has no ADD COLUMN IF NOT
// EXISTS, so check PRAGMA table_info first and only add what's actually missing.
const existingColumns = new Set(
  (db.prepare("PRAGMA table_info(orders)").all() as { name: string }[]).map((c) => c.name)
);
const migrations: [string, string][] = [
  ["product_type", "ALTER TABLE orders ADD COLUMN product_type TEXT NOT NULL DEFAULT 'esim'"],
  ["recipient_phone", "ALTER TABLE orders ADD COLUMN recipient_phone TEXT"],
  ["topup_reference", "ALTER TABLE orders ADD COLUMN topup_reference TEXT"],
];
for (const [column, sql] of migrations) {
  if (!existingColumns.has(column)) db.exec(sql);
}

export const sqliteStore: OrderStore = {
  async createOrder(order: NewOrder) {
    db.prepare(
      `INSERT INTO orders (id, plan_id, product_type, contact, recipient_phone, locale, price_usd, amount_sats, lightning_invoice, blink_payment_hash, created_at)
       VALUES (@id, @plan_id, @product_type, @contact, @recipient_phone, @locale, @price_usd, @amount_sats, @lightning_invoice, @blink_payment_hash, @created_at)`
    ).run({ ...order, created_at: Date.now() });
  },

  async getOrder(id: string) {
    return db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order | undefined;
  },

  async getOrderByPaymentHash(paymentHash: string) {
    return db.prepare("SELECT * FROM orders WHERE blink_payment_hash = ?").get(paymentHash) as
      | Order
      | undefined;
  },

  async markOrderPaid(id: string) {
    db.prepare("UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ? AND status = 'pending'").run(
      Date.now(),
      id
    );
  },

  async markOrderFulfilled(id: string, reference: { esimReference?: string; topupReference?: string }) {
    db.prepare(
      "UPDATE orders SET status = 'fulfilled', fulfilled_at = ?, esim_reference = COALESCE(?, esim_reference), topup_reference = COALESCE(?, topup_reference) WHERE id = ?"
    ).run(Date.now(), reference.esimReference ?? null, reference.topupReference ?? null, id);
  },

  async markOrderExpired(id: string) {
    db.prepare("UPDATE orders SET status = 'expired' WHERE id = ? AND status = 'pending'").run(id);
  },
};
