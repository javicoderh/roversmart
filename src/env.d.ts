/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FORMSPREE_ENDPOINT?: string;
  readonly BLOB_READ_WRITE_TOKEN?: string;
  readonly ADMIN_STATE_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
