# Cotizador de Murales

Proyecto Astro para publicar una herramienta de cotizacion independiente y enlazarla desde el menu del portfolio del artista.

## Requisitos

- Node.js 20 o superior
- npm

## Desarrollo local

```bash
npm install
npm run dev
```

## Variables de entorno

Crea un archivo `.env` basado en `.env.sample`:

```bash
cp .env.sample .env
```

Luego completa:

```text
PUBLIC_FORMSPREE_ENDPOINT=
BLOB_READ_WRITE_TOKEN=
ADMIN_STATE_SECRET=
```

## Servicios

- `Formspree` recibe los datos del formulario
- `Vercel Blob` recibe las imágenes a través de `src/pages/api/upload-image.ts`
- El token `BLOB_READ_WRITE_TOKEN` puede reutilizarse desde otro proyecto del mismo equipo si apunta al mismo store
- `ADMIN_STATE_SECRET` cifra el estado interno del admin y las cotizaciones persistidas

## Build

```bash
npm run build
```

El proyecto usa un endpoint serverless para subir imágenes, por lo que debe desplegarse en Vercel con adapter.

## Despliegue en Vercel

1. Sube este proyecto a un repositorio Git.
2. Importa el repositorio en Vercel.
3. Vercel detectara Astro automaticamente.
4. Usa estos valores si te los pide:

```text
Build Command: npm run build
Install Command: npm install
```

## Flujo actual de envio

1. El cliente completa el formulario
2. Las imágenes se optimizan en el navegador
3. Las imágenes se suben a Vercel Blob
4. El formulario envía a Formspree los datos y las URLs públicas de las imágenes
