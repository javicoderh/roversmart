import type { APIRoute } from "astro";
import { appendQuoteRecord, type QuoteRecord } from "../../lib/admin-state";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const formspreeEndpoint = import.meta.env.PUBLIC_FORMSPREE_ENDPOINT;

  if (!formspreeEndpoint) {
    return new Response(JSON.stringify({ error: "Falta configurar PUBLIC_FORMSPREE_ENDPOINT." }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }

  const body = await request.json().catch(() => null);
  const formspreePayload = body?.formspreePayload;
  const quoteRecord = body?.quoteRecord as QuoteRecord | undefined;

  if (!formspreePayload || !quoteRecord) {
    return new Response(JSON.stringify({ error: "Solicitud inválida." }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  await appendQuoteRecord(quoteRecord);

  const response = await fetch(formspreeEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(formspreePayload)
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Formspree rechazó el envío." }), {
      status: 502,
      headers: { "content-type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};
