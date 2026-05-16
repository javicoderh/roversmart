import type { APIRoute } from "astro";
import {
  createSessionCookieValue,
  getAdminCookieName,
  getSessionTtlSeconds,
  verifyAdminCredentials
} from "../../../lib/admin-state";

export const prerender = false;

function adminRedirect(redirect: APIRoute["redirect"], kind: "error" | "success", message: string) {
  const params = new URLSearchParams();
  params.set(kind, message);
  return redirect(kind === "success" ? `/admin?${params.toString()}` : `/admin?${params.toString()}`);
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const formData = await request.formData();
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return adminRedirect(redirect, "error", "Credenciales inválidas");
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
    return adminRedirect(redirect, "error", "No se pudo validar el acceso");
  }
};
