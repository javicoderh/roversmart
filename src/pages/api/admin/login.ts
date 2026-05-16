import type { APIRoute } from "astro";
import {
  createSessionCookieValue,
  getAdminCookieName,
  getSessionTtlSeconds,
  verifyAdminCredentials
} from "../../../lib/admin-state";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return redirect("/admin?error=Credenciales%20inv%C3%A1lidas");
    }

    cookies.set(getAdminCookieName(), createSessionCookieValue(username), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: import.meta.env.PROD,
      maxAge: getSessionTtlSeconds()
    });

    return redirect("/admin");
  } catch (error) {
    console.error("Admin login failed:", error);
    return redirect("/admin?error=No%20se%20pudo%20validar%20el%20acceso");
  }
};
