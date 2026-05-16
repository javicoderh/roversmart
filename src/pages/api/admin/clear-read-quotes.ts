import type { APIRoute } from "astro";
import {
  clearReadQuotes,
  getAdminCookieName,
  readSessionUsername
} from "../../../lib/admin-state";

export const prerender = false;

function wantsJson(request: Request) {
  return request.headers.get("x-requested-with") === "fetch";
}

function adminRedirect(redirect: APIRoute["redirect"], kind: "error" | "success", message: string) {
  const params = new URLSearchParams({ view: "read" });
  params.set(kind, message);
  return redirect(`/admin?${params.toString()}`);
}

function adminJson(kind: "error" | "success", message: string, status: number) {
  const params = new URLSearchParams({ view: "read" });
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
        ? adminJson("error", "Sesión inválida", 401)
        : adminRedirect(redirect, "error", "Sesión inválida");
    }

    const removedCount = await clearReadQuotes();
    return expectsJson
      ? adminJson("success", `Se borraron ${removedCount} cotizaciones`, 200)
      : adminRedirect(redirect, "success", `Se borraron ${removedCount} cotizaciones`);
  } catch (error) {
    console.error("Clear read quotes failed:", error);
    return wantsJson(request)
      ? adminJson("error", "No se pudieron borrar las cotizaciones", 500)
      : adminRedirect(redirect, "error", "No se pudieron borrar las cotizaciones");
  }
};
