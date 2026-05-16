import type { APIRoute } from "astro";
import {
  createSessionCookieValue,
  getAdminCookieName,
  getSessionTtlSeconds,
  verifyAdminCredentials
} from "../../../lib/admin-state";

export const prerender = false;

function wantsJson(request: Request) {
  return request.headers.get("x-requested-with") === "fetch";
}

function adminRedirect(redirect: APIRoute["redirect"], kind: "error" | "success", message: string) {
  const params = new URLSearchParams();
  params.set(kind, message);
  return redirect(kind === "success" ? `/admin?${params.toString()}` : `/admin?${params.toString()}`);
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
    const formData = await request.formData();
    const username = String(formData.get("username") || "");
    const password = String(formData.get("password") || "");
    const expectsJson = wantsJson(request);

    const isValid = await verifyAdminCredentials(username, password);

    if (!isValid) {
      return expectsJson
        ? adminJson("error", "Credenciales inválidas", 401)
        : adminRedirect(redirect, "error", "Credenciales inválidas");
    }

    cookies.set(getAdminCookieName(), createSessionCookieValue(username), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: import.meta.env.PROD,
      maxAge: getSessionTtlSeconds()
    });

    return expectsJson
      ? new Response(JSON.stringify({ ok: true, redirectTo: "/admin" }), {
          status: 200,
          headers: { "content-type": "application/json" }
        })
      : redirect("/admin");
  } catch (error) {
    console.error("Admin login failed:", error);
    return wantsJson(request)
      ? adminJson("error", "No se pudo validar el acceso", 500)
      : adminRedirect(redirect, "error", "No se pudo validar el acceso");
  }
};
