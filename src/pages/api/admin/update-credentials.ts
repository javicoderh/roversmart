import type { APIRoute } from "astro";
import {
  createSessionCookieValue,
  getAdminCookieName,
  getSessionTtlSeconds,
  readSessionUsername,
  updateAdminCredentials
} from "../../../lib/admin-state";

export const prerender = false;

function adminRedirect(redirect: APIRoute["redirect"], kind: "error" | "success", message: string) {
  const params = new URLSearchParams();
  params.set(kind, message);
  return redirect(`/admin?${params.toString()}`);
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  try {
    const sessionUser = await readSessionUsername(cookies.get(getAdminCookieName())?.value);

    if (!sessionUser) {
      return adminRedirect(redirect, "error", "Debes iniciar sesión");
    }

    const formData = await request.formData();
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (username.length < 4 || password.length < 8) {
      return adminRedirect(redirect, "error", "Usuario o password inválidos");
    }

    await updateAdminCredentials(username, password);

    cookies.set(getAdminCookieName(), createSessionCookieValue(username), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: import.meta.env.PROD,
      maxAge: getSessionTtlSeconds()
    });

    return adminRedirect(redirect, "success", "Credenciales actualizadas");
  } catch (error) {
    console.error("Update admin credentials failed:", error);
    return adminRedirect(redirect, "error", "No se pudieron actualizar las credenciales");
  }
};
