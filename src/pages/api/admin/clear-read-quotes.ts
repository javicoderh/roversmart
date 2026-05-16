import type { APIRoute } from "astro";
import {
  clearReadQuotes,
  getAdminCookieName,
  readSessionUsername
} from "../../../lib/admin-state";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const sessionUser = await readSessionUsername(cookies.get(getAdminCookieName())?.value);

  if (!sessionUser) {
    return redirect("/admin?error=Sesión%20inválida");
  }

  const removedCount = await clearReadQuotes();
  return redirect(`/admin?view=read&success=${encodeURIComponent(`Se borraron ${removedCount} cotizaciones`)}`);
};
