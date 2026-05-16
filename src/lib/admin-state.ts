import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { list, put } from "@vercel/blob";

const STATE_PATH = "private/cotizador-admin-state.json";
const COOKIE_NAME = "cotizador_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type QuoteRecord = {
  id: string;
  createdAt: string;
  contact: {
    name: string;
    email: string;
    phone: string;
    clientDescription: string;
  };
  projects: Array<{
    id: string;
    title: string;
    alto: string;
    ancho: string;
    ubicacion: string;
    estado: string;
    bodegaDisponible: boolean;
    estacionamientoDisponible: boolean;
    descripcionMuro: string;
    tiposMural: string[];
    uso: string;
    idea: string;
    proteccion: string[];
    fotoFrontalUrls: string[];
    referenciasUrls: string[];
  }>;
  process: string[];
};

type AdminState = {
  credentials: {
    username: string;
    passwordHash: string;
    salt: string;
  };
  quotes: QuoteRecord[];
};

function getStateSecret() {
  const secret = import.meta.env.ADMIN_STATE_SECRET || import.meta.env.BLOB_READ_WRITE_TOKEN;

  if (!secret) {
    throw new Error("Falta configurar ADMIN_STATE_SECRET o BLOB_READ_WRITE_TOKEN.");
  }

  return secret;
}

function deriveEncryptionKey() {
  return createHash("sha256").update(getStateSecret()).digest();
}

function sign(value: string) {
  return createHmac("sha256", getStateSecret()).update(value).digest("hex");
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function createEncryptedPayload(state: AdminState) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(state), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64")
  });
}

function decryptState(payload: string) {
  const parsed = JSON.parse(payload) as { iv: string; tag: string; data: string };
  const decipher = createDecipheriv(
    "aes-256-gcm",
    deriveEncryptionKey(),
    Buffer.from(parsed.iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(parsed.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.data, "base64")),
    decipher.final()
  ]).toString("utf8");

  return JSON.parse(decrypted) as AdminState;
}

async function findStateBlobUrl() {
  const result = await list({
    prefix: STATE_PATH,
    token: import.meta.env.BLOB_READ_WRITE_TOKEN
  });

  const match = result.blobs.find((blob) => blob.pathname === STATE_PATH);
  return match?.url ?? null;
}

function createDefaultState(): AdminState {
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

async function saveState(state: AdminState) {
  await put(STATE_PATH, createEncryptedPayload(state), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    token: import.meta.env.BLOB_READ_WRITE_TOKEN
  });
}

export async function loadAdminState() {
  const blobUrl = await findStateBlobUrl();

  if (!blobUrl) {
    const defaultState = createDefaultState();
    await saveState(defaultState);
    return defaultState;
  }

  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error("No se pudo leer el estado del administrador.");
  }

  const rawPayload = await response.text();
  return decryptState(rawPayload);
}

export async function appendQuoteRecord(quote: QuoteRecord) {
  const state = await loadAdminState();
  state.quotes.unshift(quote);
  await saveState(state);
}

export async function updateAdminCredentials(username: string, password: string) {
  const state = await loadAdminState();
  const salt = randomBytes(16).toString("hex");

  state.credentials = {
    username,
    passwordHash: hashPassword(password, salt),
    salt
  };

  await saveState(state);
}

export async function verifyAdminCredentials(username: string, password: string) {
  const state = await loadAdminState();
  const hashed = hashPassword(password, state.credentials.salt);

  const expected = Buffer.from(state.credentials.passwordHash, "hex");
  const received = Buffer.from(hashed, "hex");

  if (expected.length !== received.length) return false;

  return state.credentials.username === username && timingSafeEqual(expected, received);
}

export function createSessionCookieValue(username: string) {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      exp: Date.now() + SESSION_TTL_MS
    }),
    "utf8"
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

export async function readSessionUsername(cookieValue?: string | null) {
  if (!cookieValue) return null;

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return null;
  if (sign(payload) !== signature) return null;

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
    username: string;
    exp: number;
  };

  if (parsed.exp < Date.now()) return null;

  const state = await loadAdminState();
  if (state.credentials.username !== parsed.username) return null;

  return parsed.username;
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function getSessionTtlSeconds() {
  return Math.floor(SESSION_TTL_MS / 1000);
}
