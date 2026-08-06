import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// SQLite is a deliberate local-dev-only choice — it's zero-setup and keeps orders across restarts
// without standing up a hosted database before there's anything real to store. Swap this for a
// hosted Postgres (e.g. Neon/Supabase) before deploying anywhere serverless: the filesystem isn't
// persistent across invocations on platforms like Vercel, so SQLite writes would silently vanish.
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

export type OrderStatus = "pending" | "paid" | "fulfilled" | "expired" | "failed";

export type Order = {
  id: string;
  plan_id: string;
  contact: string;
  locale: string;
  price_usd: number;
  amount_sats: number | null;
  status: OrderStatus;
  lightning_invoice: string | null;
  blink_payment_hash: string | null;
  esim_reference: string | null;
  created_at: number;
  paid_at: number | null;
  fulfilled_at: number | null;
};

export function createOrder(order: {
  id: string;
  plan_id: string;
  contact: string;
  locale: string;
  price_usd: number;
  amount_sats: number | null;
  lightning_invoice: string | null;
  blink_payment_hash: string | null;
}): void {
  db.prepare(
    `INSERT INTO orders (id, plan_id, contact, locale, price_usd, amount_sats, lightning_invoice, blink_payment_hash, created_at)
     VALUES (@id, @plan_id, @contact, @locale, @price_usd, @amount_sats, @lightning_invoice, @blink_payment_hash, @created_at)`
  ).run({ ...order, created_at: Date.now() });
}

export function getOrder(id: string): Order | undefined {
  return db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as Order | undefined;
}

export function getOrderByPaymentHash(paymentHash: string): Order | undefined {
  return db.prepare("SELECT * FROM orders WHERE blink_payment_hash = ?").get(paymentHash) as
    | Order
    | undefined;
}

export function markOrderPaid(id: string): void {
  db.prepare("UPDATE orders SET status = 'paid', paid_at = ? WHERE id = ? AND status = 'pending'").run(Date.now(), id);
}

export function markOrderFulfilled(id: string, esimReference: string): void {
  db.prepare("UPDATE orders SET status = 'fulfilled', fulfilled_at = ?, esim_reference = ? WHERE id = ?").run(
    Date.now(),
    esimReference,
    id
  );
}

export function markOrderExpired(id: string): void {
  db.prepare("UPDATE orders SET status = 'expired' WHERE id = ? AND status = 'pending'").run(id);
}

export default db;
