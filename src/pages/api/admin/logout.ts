import type { APIRoute } from "astro";
import { getAdminCookieName } from "../../../lib/admin-state";

export const prerender = false;

export const POST: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete(getAdminCookieName(), {
    path: "/"
  });

  return redirect("/admin");
};
