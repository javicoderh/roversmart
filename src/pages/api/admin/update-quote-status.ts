import type { APIRoute } from "astro";
import {
  getAdminCookieName,
  readSessionUsername,
  updateQuoteStatus
} from "../../../lib/admin-state";

export const prerender = false;

function wantsJson(request: Request) {
  return request.headers.get("x-requested-with") === "fetch";
}

function adminRedirect(redirect: APIRoute["redirect"], view: string | null, kind: "error" | "success", message: string) {
  const params = new URLSearchParams();

  if (view) {
    params.set("view", view);
  }

  params.set(kind, message);
  return redirect(`/admin?${params.toString()}`);
}

function adminJson(view: string | null, kind: "error" | "success", message: string, status: number) {
  const params = new URLSearchParams();

  if (view) {
    params.set("view", view);
  }

  params.set(kind, message);

  return new Response(JSON.stringify({
    ok: kind === "success",
    redirectTo: `/admin?${params.toString()}`
  }), {
    status,
    headers: { "content-type": "application/json" }
  });
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const sessionUser = await readSessionUsername(cookies.get(getAdminCookieName())?.value);
    const expectsJson = wantsJson(request);

    if (!sessionUser) {
      return expectsJson
        ? adminJson(null, "error", "Sesión inválida", 401)
        : adminRedirect(redirect, null, "error", "Sesión inválida");
    }

    const formData = await request.formData();
    const id = String(formData.get("id") || "");
    const status = String(formData.get("status") || "");
    const view = String(formData.get("view") || "pending");

    if (!id || (status !== "pending" && status !== "read")) {
      return expectsJson
        ? adminJson(view, "error", "Acción inválida", 400)
        : adminRedirect(redirect, view, "error", "Acción inválida");
    }

    const updated = await updateQuoteStatus(id, status);

    if (!updated) {
      return expectsJson
        ? adminJson(view, "error", "Cotización no encontrada", 404)
        : adminRedirect(redirect, view, "error", "Cotización no encontrada");
    }

    return expectsJson
      ? adminJson(view, "success", "Estado actualizado", 200)
      : adminRedirect(redirect, view, "success", "Estado actualizado");
  } catch (error) {
    console.error("Update quote status failed:", error);
    return wantsJson(request)
      ? adminJson(null, "error", "No se pudo actualizar la cotización", 500)
      : adminRedirect(redirect, null, "error", "No se pudo actualizar la cotización");
  }
};
