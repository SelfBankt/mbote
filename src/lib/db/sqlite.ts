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
    contact TEXT NOT NULL,
    locale TEXT NOT NULL,
    price_usd REAL NOT NULL,
    amount_sats INTEGER,
    status TEXT NOT NULL DEFAULT 'pending', -- pending -> paid -> fulfilled, or -> expired / failed
    lightning_invoice TEXT,
    blink_payment_hash TEXT,
    esim_reference TEXT, -- Maya Mobile order/eSIM id once fulfilled
    created_at INTEGER NOT NULL,
    paid_at INTEGER,
    fulfilled_at INTEGER
  );
`);

export const sqliteStore: OrderStore = {
  async createOrder(order: NewOrder) {
    db.prepare(
      `INSERT INTO orders (id, plan_id, contact, locale, price_usd, amount_sats, lightning_invoice, blink_payment_hash, created_at)
       VALUES (@id, @plan_id, @contact, @locale, @price_usd, @amount_sats, @lightning_invoice, @blink_payment_hash, @created_at)`
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

  async markOrderFulfilled(id: string, esimReference: string) {
    db.prepare("UPDATE orders SET status = 'fulfilled', fulfilled_at = ?, esim_reference = ? WHERE id = ?").run(
      Date.now(),
      esimReference,
      id
    );
  },

  async markOrderExpired(id: string) {
    db.prepare("UPDATE orders SET status = 'expired' WHERE id = ? AND status = 'pending'").run(id);
  },
};
