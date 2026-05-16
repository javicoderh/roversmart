import type { APIRoute } from "astro";
import {
  getAdminCookieName,
  readSessionUsername,
  updateQuoteStatus
} from "../../../lib/admin-state";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const sessionUser = await readSessionUsername(cookies.get(getAdminCookieName())?.value);

  if (!sessionUser) {
    return redirect("/admin?error=Sesión%20inválida");
  }

  const formData = await request.formData();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const view = String(formData.get("view") || "pending");

  if (!id || (status !== "pending" && status !== "read")) {
    return redirect(`/admin?view=${encodeURIComponent(view)}&error=Acción%20inválida`);
  }

  const updated = await updateQuoteStatus(id, status);

  if (!updated) {
    return redirect(`/admin?view=${encodeURIComponent(view)}&error=Cotización%20no%20encontrada`);
  }

  return redirect(`/admin?view=${encodeURIComponent(view)}&success=Estado%20actualizado`);
};
