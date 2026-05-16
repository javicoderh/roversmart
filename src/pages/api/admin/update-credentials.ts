import type { APIRoute } from "astro";
import {
  createSessionCookieValue,
  getAdminCookieName,
  getSessionTtlSeconds,
  readSessionUsername,
  updateAdminCredentials
} from "../../../lib/admin-state";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const sessionUser = await readSessionUsername(cookies.get(getAdminCookieName())?.value);

    if (!sessionUser) {
      return redirect("/admin?error=Debes%20iniciar%20sesi%C3%B3n");
    }

    const formData = await request.formData();
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (username.length < 4 || password.length < 8) {
      return redirect("/admin?error=Usuario%20o%20password%20inv%C3%A1lidos");
    }

    await updateAdminCredentials(username, password);

    cookies.set(getAdminCookieName(), createSessionCookieValue(username), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: import.meta.env.PROD,
      maxAge: getSessionTtlSeconds()
    });

    return redirect("/admin?success=Credenciales%20actualizadas");
  } catch (error) {
    console.error("Update admin credentials failed:", error);
    return redirect("/admin?error=No%20se%20pudieron%20actualizar%20las%20credenciales");
  }
};
