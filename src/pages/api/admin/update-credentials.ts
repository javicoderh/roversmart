import type { APIRoute } from "astro";
import {
  createSessionCookieValue,
  getAdminCookieName,
  getSessionTtlSeconds,
  readSessionUsername,
  updateAdminCredentials
} from "../../../lib/admin-state";

export const prerender = false;

function wantsJson(request: Request) {
  return request.headers.get("x-requested-with") === "fetch";
}

function adminRedirect(redirect: APIRoute["redirect"], kind: "error" | "success", message: string) {
  const params = new URLSearchParams();
  params.set(kind, message);
  return redirect(`/admin?${params.toString()}`);
}

function adminJson(kind: "error" | "success", message: string, status: number) {
  const params = new URLSearchParams();
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
        ? adminJson("error", "Debes iniciar sesión", 401)
        : adminRedirect(redirect, "error", "Debes iniciar sesión");
    }

    const formData = await request.formData();
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "");

    if (username.length < 4 || password.length < 8) {
      return expectsJson
        ? adminJson("error", "Usuario o password inválidos", 400)
        : adminRedirect(redirect, "error", "Usuario o password inválidos");
    }

    await updateAdminCredentials(username, password);

    cookies.set(getAdminCookieName(), createSessionCookieValue(username), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: import.meta.env.PROD,
      maxAge: getSessionTtlSeconds()
    });

    return expectsJson
      ? adminJson("success", "Credenciales actualizadas", 200)
      : adminRedirect(redirect, "success", "Credenciales actualizadas");
  } catch (error) {
    console.error("Update admin credentials failed:", error);
    return wantsJson(request)
      ? adminJson("error", "No se pudieron actualizar las credenciales", 500)
      : adminRedirect(redirect, "error", "No se pudieron actualizar las credenciales");
  }
};
