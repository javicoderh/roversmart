import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { get, list, put } from "@vercel/blob";

const LEGACY_STATE_PATH = "private/cotizador-admin-state.json";
const STATE_PREFIX = "private/cotizador-admin-state/";
const COOKIE_NAME = "cotizador_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type QuoteRecord = {
  id: string;
  createdAt: string;
  status: "pending" | "read";
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

function normalizeQuoteRecord(quote: any): QuoteRecord {
  return {
    ...quote,
    status: quote.status === "read" ? "read" : "pending"
  };
}

function getStateSecret() {
  const secret = import.meta.env.ADMIN_STATE_SECRET || import.meta.env.BLOB_READ_WRITE_TOKEN;

  if (!secret) {
    throw new Error("Falta configurar ADMIN_STATE_SECRET o BLOB_READ_WRITE_TOKEN.");
  }

  return secret;
}

function getStateSecretCandidates() {
  const secrets = [
    import.meta.env.ADMIN_STATE_SECRET,
    import.meta.env.BLOB_READ_WRITE_TOKEN
  ].filter((value): value is string => Boolean(value));

  if (!secrets.length) {
    throw new Error("Falta configurar ADMIN_STATE_SECRET o BLOB_READ_WRITE_TOKEN.");
  }

  return [...new Set(secrets)];
}

function deriveEncryptionKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

function sign(value: string) {
  return createHmac("sha256", getStateSecret()).update(value).digest("hex");
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

function createEncryptedPayload(state: AdminState) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveEncryptionKey(getStateSecret()), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(state), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    data: encrypted.toString("base64")
  });
}

function tryDecryptState(payload: string, secret: string) {
  const parsed = JSON.parse(payload) as { iv: string; tag: string; data: string };
  const decipher = createDecipheriv(
    "aes-256-gcm",
    deriveEncryptionKey(secret),
    Buffer.from(parsed.iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(parsed.tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.data, "base64")),
    decipher.final()
  ]).toString("utf8");

  return JSON.parse(decrypted) as AdminState;
}

function decryptState(payload: string) {
  let lastError: unknown = null;

  for (const secret of getStateSecretCandidates()) {
    try {
      return tryDecryptState(payload, secret);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("No se pudo descifrar el estado del administrador.");
}

type StateBlobRef = {
  pathname: string;
  url: string;
  uploadedAt?: Date;
};

async function findLegacyStateBlob() {
  const result = await list({
    prefix: LEGACY_STATE_PATH,
    token: import.meta.env.BLOB_READ_WRITE_TOKEN
  });

  const match = result.blobs.find((blob) => blob.pathname === LEGACY_STATE_PATH);
  return match ? { pathname: match.pathname, url: match.url, uploadedAt: match.uploadedAt } : null;
}

async function findLatestVersionedStateBlob() {
  const result = await list({
    prefix: STATE_PREFIX,
    token: import.meta.env.BLOB_READ_WRITE_TOKEN
  });

  const latest = [...result.blobs]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())[0];

  return latest ? { pathname: latest.pathname, url: latest.url, uploadedAt: latest.uploadedAt } : null;
}

async function loadStatePayloadFromPrivateBlob(pathname: string) {
  try {
    const blob = await get(pathname, {
      access: "private",
      useCache: false,
      token: import.meta.env.BLOB_READ_WRITE_TOKEN
    });

    if (!blob || blob.statusCode !== 200 || !blob.stream) {
      return null;
    }

    return await new Response(blob.stream).text();
  } catch {
    return null;
  }
}

async function loadStatePayloadFromPublicUrl(blobUrl: string) {
  try {
    const url = new URL(blobUrl);
    url.searchParams.set("_ts", Date.now().toString());

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "cache-control": "no-cache"
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  }
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
  const payload = createEncryptedPayload(state);
  const pathname = `${STATE_PREFIX}${Date.now()}-${randomUUID().slice(0, 8)}.json`;

  try {
    await put(pathname, payload, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: "application/json",
      token: import.meta.env.BLOB_READ_WRITE_TOKEN
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes("Cannot use private access on a public store")) {
      throw error;
    }

    await put(pathname, payload, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: false,
      contentType: "application/json",
      token: import.meta.env.BLOB_READ_WRITE_TOKEN
    });
  }
}

export async function loadAdminState() {
  const versionedBlob = await findLatestVersionedStateBlob();

  if (versionedBlob) {
    const rawPayload =
      await loadStatePayloadFromPrivateBlob(versionedBlob.pathname)
      ?? await loadStatePayloadFromPublicUrl(versionedBlob.url);

    if (!rawPayload) {
      throw new Error("No se pudo leer el estado del administrador.");
    }

    const state = decryptState(rawPayload);
    state.quotes = state.quotes.map(normalizeQuoteRecord);
    return state;
  }

  const legacyBlob = await findLegacyStateBlob();

  if (!legacyBlob) {
    const defaultState = createDefaultState();
    await saveState(defaultState);
    return defaultState;
  }

  const rawPayload =
    await loadStatePayloadFromPrivateBlob(legacyBlob.pathname)
    ?? await loadStatePayloadFromPublicUrl(legacyBlob.url);

  if (!rawPayload) {
    throw new Error("No se pudo leer el estado del administrador.");
  }

  const state = decryptState(rawPayload);
  state.quotes = state.quotes.map(normalizeQuoteRecord);
  await saveState(state);
  return state;
}

export async function appendQuoteRecord(quote: QuoteRecord) {
  const state = await loadAdminState();
  state.quotes.unshift(normalizeQuoteRecord(quote));
  await saveState(state);
}

export async function updateQuoteStatus(id: string, status: QuoteRecord["status"]) {
  const state = await loadAdminState();
  const quote = state.quotes.find((entry) => entry.id === id);

  if (!quote) return false;

  quote.status = status;
  await saveState(state);
  return true;
}

export async function clearReadQuotes() {
  const state = await loadAdminState();
  const nextQuotes = state.quotes.filter((quote) => normalizeQuoteRecord(quote).status !== "read");
  const removedCount = state.quotes.length - nextQuotes.length;
  state.quotes = nextQuotes;
  await saveState(state);
  return removedCount;
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
