import type { OrderStore } from "./types";

export type { Order, OrderStatus, NewOrder } from "./types";

// Postgres in production (DATABASE_URL set — see postgres.ts for where that comes from), SQLite
// for local dev otherwise (see sqlite.ts). Deliberately require(), not a static import: both
// modules run side-effecting setup at load time (sqlite.ts opens/creates a file, postgres.ts opens
// a connection) — a static `import` would run *both* regardless of which one is actually used,
// and sqlite.ts's `fs.mkdirSync` would throw immediately on Vercel's read-only filesystem even in
// a Postgres-only deployment. The conditional require() ensures only the selected backend's
// module-level code ever executes.
const store: OrderStore = process.env.DATABASE_URL
  ? // eslint-disable-next-line @typescript-eslint/no-require-imports -- see comment above
    require("./postgres").postgresStore
  : // eslint-disable-next-line @typescript-eslint/no-require-imports -- see comment above
    require("./sqlite").sqliteStore;

export const createOrder = store.createOrder;
export const getOrder = store.getOrder;
export const getOrderByPaymentHash = store.getOrderByPaymentHash;
export const markOrderPaid = store.markOrderPaid;
export const markOrderFulfilled = store.markOrderFulfilled;
export const markOrderExpired = store.markOrderExpired;
