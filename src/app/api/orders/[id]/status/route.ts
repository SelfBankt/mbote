import { NextResponse } from "next/server";
import { getOrder } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/orders/[id]/status">
) {
  const { id } = await ctx.params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: order.status,
    esimReference: order.esim_reference,
  });
}
