import type { APIRoute } from "astro";
import { getAdminCookieName } from "../../../lib/admin-state";

export const prerender = false;

function wantsJson(request: Request) {
  return request.headers.get("x-requested-with") === "fetch";
}

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  cookies.delete(getAdminCookieName(), {
    path: "/"
  });

  return wantsJson(request)
    ? new Response(JSON.stringify({ ok: true, redirectTo: "/admin" }), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    : redirect("/admin");
};
