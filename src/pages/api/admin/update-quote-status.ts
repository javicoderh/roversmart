import type { APIRoute } from "astro";
import {
  getAdminCookieName,
  readSessionUsername,
  updateQuoteStatus
} from "../../../lib/admin-state";

export const prerender = false;

function adminRedirect(redirect: APIRoute["redirect"], view: string | null, kind: "error" | "success", message: string) {
  const params = new URLSearchParams();

  if (view) {
    params.set("view", view);
  }

  params.set(kind, message);
  return redirect(`/admin?${params.toString()}`);
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const sessionUser = await readSessionUsername(cookies.get(getAdminCookieName())?.value);

    if (!sessionUser) {
      return adminRedirect(redirect, null, "error", "Sesión inválida");
    }

    const formData = await request.formData();
    const id = String(formData.get("id") || "");
    const status = String(formData.get("status") || "");
    const view = String(formData.get("view") || "pending");

    if (!id || (status !== "pending" && status !== "read")) {
      return adminRedirect(redirect, view, "error", "Acción inválida");
    }

    const updated = await updateQuoteStatus(id, status);

    if (!updated) {
      return adminRedirect(redirect, view, "error", "Cotización no encontrada");
    }

    return adminRedirect(redirect, view, "success", "Estado actualizado");
  } catch (error) {
    console.error("Update quote status failed:", error);
    return adminRedirect(redirect, null, "error", "No se pudo actualizar la cotización");
  }
};
