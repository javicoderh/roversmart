import type { APIRoute } from "astro";
import {
  clearReadQuotes,
  getAdminCookieName,
  readSessionUsername
} from "../../../lib/admin-state";

export const prerender = false;

function adminRedirect(redirect: APIRoute["redirect"], kind: "error" | "success", message: string) {
  const params = new URLSearchParams({ view: "read" });
  params.set(kind, message);
  return redirect(`/admin?${params.toString()}`);
}

export const POST: APIRoute = async ({ cookies, redirect }) => {
  try {
    const sessionUser = await readSessionUsername(cookies.get(getAdminCookieName())?.value);

    if (!sessionUser) {
      return adminRedirect(redirect, "error", "Sesión inválida");
    }

    const removedCount = await clearReadQuotes();
    return adminRedirect(redirect, "success", `Se borraron ${removedCount} cotizaciones`);
  } catch (error) {
    console.error("Clear read quotes failed:", error);
    return adminRedirect(redirect, "error", "No se pudieron borrar las cotizaciones");
  }
};
