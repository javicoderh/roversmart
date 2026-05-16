import { readFile, readdir } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from "node:crypto";
import { list, put } from "@vercel/blob";

const ROOT = process.cwd();
const ENV_PATH = join(ROOT, ".env");
const DOWNLOADS_DIR = "/home/javier/Downloads";
const STATE_PATH = "private/cotizador-admin-state.json";
const PROJECT_COUNT = 3;
const WALL_IMAGES_PER_PROJECT = 3;
const REFERENCE_IMAGES_PER_PROJECT = 2;
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function parseEnv(raw) {
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);
    env[key] = value;
  }
  return env;
}

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}

function deriveEncryptionKey(secret) {
  return createHash("sha256").update(secret).digest();
}

function encryptState(state, secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveEncryptionKey(secret), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(state), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64")
  });
}

function decryptState(payload, secret) {
  const parsed = JSON.parse(payload);
  const decipher = createDecipheriv("aes-256-gcm", deriveEncryptionKey(secret), Buffer.from(parsed.iv, "base64"));
  decipher.setAuthTag(Buffer.from(parsed.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.data, "base64")),
    decipher.final()
  ]).toString("utf8");
  return JSON.parse(decrypted);
}

async function loadState(token, secret) {
  const result = await list({ prefix: STATE_PATH, token });
  const match = result.blobs.find((blob) => blob.pathname === STATE_PATH);

  if (!match) {
    const salt = randomBytes(16).toString("hex");
    return {
      credentials: {
        username: "RoverSmartArt",
        passwordHash: hashPassword("RoverSmartArt", salt),
        salt
      },
      quotes: []
    };
  }

  const response = await fetch(match.url);
  if (!response.ok) throw new Error("No se pudo leer el estado actual del admin.");
  return decryptState(await response.text(), secret);
}

async function saveState(state, token, secret) {
  await put(STATE_PATH, encryptState(state, secret), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token
  });
}

function shuffle(items) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

async function getDownloadImages() {
  const entries = await readdir(DOWNLOADS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(extname(entry.name).toLowerCase()))
    .map((entry) => join(DOWNLOADS_DIR, entry.name));
}

async function uploadImage(filePath, token, folder) {
  const file = await readFile(filePath);
  const extension = extname(filePath).toLowerCase().replace(".jpeg", ".jpg").replace(".", "");
  const filename = `${folder}/${Date.now()}-${randomBytes(4).toString("hex")}-${basename(filePath, extname(filePath))}.${extension}`;
  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
    token
  });
  return blob.url;
}

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  const token = env.BLOB_READ_WRITE_TOKEN;
  const secret = env.ADMIN_STATE_SECRET || token;

  if (!token) throw new Error("Falta BLOB_READ_WRITE_TOKEN en .env");

  const availableImages = shuffle(await getDownloadImages());
  const needed = PROJECT_COUNT * (WALL_IMAGES_PER_PROJECT + REFERENCE_IMAGES_PER_PROJECT);

  if (availableImages.length < needed) {
    throw new Error(`No hay suficientes imágenes en Downloads. Se necesitan ${needed} y solo hay ${availableImages.length}.`);
  }

  const state = await loadState(token, secret);
  const imageQueue = [...availableImages];
  const projects = [];

  console.log(`Iniciando siembra con ${PROJECT_COUNT} proyectos y ${needed} imágenes.`);

  for (let index = 0; index < PROJECT_COUNT; index += 1) {
    const wallPaths = imageQueue.splice(0, WALL_IMAGES_PER_PROJECT);
    const referencePaths = imageQueue.splice(0, REFERENCE_IMAGES_PER_PROJECT);
    const wallUrls = [];
    const referenceUrls = [];

    for (const path of wallPaths) {
      wallUrls.push(await uploadImage(path, token, `quotes/seed/project-${index + 1}/wall`));
    }

    for (const path of referencePaths) {
      referenceUrls.push(await uploadImage(path, token, `quotes/seed/project-${index + 1}/references`));
    }

    projects.push({
      id: randomBytes(8).toString("hex"),
      title: `Proyecto ${index + 1}`,
      alto: `${2 + index}`,
      ancho: `${5 + index}`,
      ubicacion: ["Santiago", "Valparaíso / Viña del Mar", "Región del Biobío", "Internacional", "Otra región de Chile"][index],
      estado: index % 2 === 0 ? "Listo para pintar" : "Requiere mantención",
      bodegaDisponible: index % 2 === 0,
      estacionamientoDisponible: index % 3 !== 0,
      descripcionMuro: `Proyecto de prueba ${index + 1} cargado automáticamente para validar el dashboard multi-proyecto.`,
      tiposMural: index % 2 === 0 ? ["Minimal", "Intermedio"] : ["Detallado"],
      uso: ["Decorativo personal", "Negocio / marketing", "Evento", "Espacio público", "Negocio / marketing"][index],
      idea: `Concepto ficticio ${index + 1}: mural temático orientado a prueba funcional del cotizador y revisión visual del dashboard.`,
      proteccion: ["Sellante"],
      fotoFrontalUrls: wallUrls,
      referenciasUrls: referenceUrls
    });

    console.log(`Proyecto ${index + 1}/${PROJECT_COUNT} cargado.`);
  }

  state.quotes.unshift({
    id: randomBytes(8).toString("hex"),
    createdAt: new Date().toISOString(),
    contact: {
      name: "Cliente Demo Dashboard",
      email: "demo.dashboard@roversmart.art",
      phone: "+56 9 5555 5555",
      clientDescription: "Cotización ficticia insertada automáticamente para revisar el dashboard con el máximo de proyectos."
    },
    projects,
    process: [
      "Cliente completa el formulario de cotización.",
      "Cliente recibe la cotización en 3-5 días hábiles aprox. desde la solicitud.",
      "De ser aprobada la cotización, el cliente debe abonar el 50% del ítem diseño.",
      "Reunión cliente-artista.",
      "Comienza el proceso de feedback para el diseño.",
      "Aprobado el diseño, cliente debe abonar el 50% restante de este + ítem materiales y logística.",
      "Proceso de compra de materiales / mezcla de colores.",
      "Ejecución del mural.",
      "Entrega del mural.",
      "Pago final [máximo 5 días hábiles desde la entrega]."
    ]
  });

  console.log("Guardando estado admin...");
  await saveState(state, token, secret);
  console.log(`Cotización demo creada con ${PROJECT_COUNT} proyectos.`);
}

await main();
