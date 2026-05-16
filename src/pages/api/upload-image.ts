import type { APIRoute } from "astro";
import { put } from "@vercel/blob";

export const prerender = false;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.BLOB_READ_WRITE_TOKEN) {
    return new Response(JSON.stringify({ error: "Falta configurar BLOB_READ_WRITE_TOKEN." }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") || "quotes");

  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "No se recibió ningún archivo." }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(JSON.stringify({ error: "Solo se permiten imágenes JPG, PNG, WebP o GIF." }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: "La imagen no puede superar los 8 MB." }), {
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    token: import.meta.env.BLOB_READ_WRITE_TOKEN
  });

  return new Response(JSON.stringify({ url: blob.url }), {
    status: 200,
    headers: { "content-type": "application/json" }
  });
};
