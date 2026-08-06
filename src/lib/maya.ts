// Maya Mobile Connect+ API client — eSIM fulfillment once a customer's payment is confirmed.
//
// IMPORTANT: Maya Mobile's full Connectivity API reference (exact endpoint paths, auth, complete
// request/response schemas) is distributed under NDA to onboarded partners — it isn't public.
// The shapes below come from what IS publicly documented (via apis.io's indexed schema summary):
// a `CreateEsimRequest { plan_id, region, country }` and a `CreateOrderRequest { esim_id, items:
// [{ plan_id, quantity }] }`. This is a best-effort approximation, not a confirmed contract —
// reconcile field names/response shape against the real partner docs the moment a Maya Mobile
// account exists, before wiring MAYA_API_KEY in any real environment.
//
// Until then this runs in mock mode: fulfillOrder() returns a fake activation code so the
// checkout -> "your eSIM is ready" flow can be built and demoed end-to-end.

const MAYA_API_URL = process.env.MAYA_API_URL ?? "https://api.maya.net/connect";

export function isMayaConfigured(): boolean {
  return Boolean(process.env.MAYA_API_KEY);
}

export type FulfilledEsim = {
  esimReference: string; // Maya's eSIM/order id — stored on the order for support lookups
  lpaActivationCode: string; // the "LPA:1$..." string a phone's eSIM installer scans/accepts
  iccid: string | null;
};

export async function fulfillOrder(params: {
  planId: string;
  orderId: string; // mbote's own order id, passed as an external reference if Maya supports one
}): Promise<FulfilledEsim> {
  if (!isMayaConfigured()) {
    return fulfillOrderMock(params);
  }

  // Best-effort request shape — see the file header caveat. This will very likely need
  // adjustment against the real partner API reference.
  const res = await fetch(`${MAYA_API_URL}/esims`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MAYA_API_KEY}`,
    },
    body: JSON.stringify({
      plan_id: params.planId,
      external_reference: params.orderId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Maya Mobile API error: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return {
    esimReference: data.id ?? data.esim_id,
    lpaActivationCode: data.lpa_activation_code ?? data.activation_code,
    iccid: data.iccid ?? null,
  };
}

function fulfillOrderMock(params: { planId: string; orderId: string }): FulfilledEsim {
  return {
    esimReference: `mock-${params.orderId.slice(0, 8)}`,
    lpaActivationCode: `LPA:1$mock.mbote.local$${params.planId}-${Date.now()}`,
    iccid: null,
  };
}
