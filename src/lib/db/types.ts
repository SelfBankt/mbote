export type OrderStatus = "pending" | "paid" | "fulfilled" | "expired" | "failed";

// "esim" = Maya Mobile eSIM provisioning (esim_reference). "topup" = Reloadly data top-up onto an
// existing DRC number (recipient_phone required, topup_reference on fulfillment) — see
// src/lib/topups.ts and src/lib/reloadly.ts.
export type ProductType = "esim" | "topup";

export type Order = {
  id: string;
  plan_id: string;
  product_type: ProductType;
  contact: string;
  recipient_phone: string | null;
  locale: string;
  price_usd: number;
  amount_sats: number | null;
  status: OrderStatus;
  lightning_invoice: string | null;
  blink_payment_hash: string | null;
  esim_reference: string | null;
  topup_reference: string | null;
  created_at: number;
  paid_at: number | null;
  fulfilled_at: number | null;
};

export type NewOrder = {
  id: string;
  plan_id: string;
  product_type: ProductType;
  contact: string;
  recipient_phone: string | null;
  locale: string;
  price_usd: number;
  amount_sats: number | null;
  lightning_invoice: string | null;
  blink_payment_hash: string | null;
};

// Both backends (sqlite.ts for local dev, postgres.ts for production) implement this same async
// interface — see db/index.ts for which one gets picked. Async on both sides even though
// better-sqlite3 itself is synchronous, so callers never need to know or care which backend is
// active.
export interface OrderStore {
  createOrder(order: NewOrder): Promise<void>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByPaymentHash(paymentHash: string): Promise<Order | undefined>;
  markOrderPaid(id: string): Promise<void>;
  markOrderFulfilled(
    id: string,
    reference: { esimReference?: string; topupReference?: string }
  ): Promise<void>;
  markOrderExpired(id: string): Promise<void>;
}
