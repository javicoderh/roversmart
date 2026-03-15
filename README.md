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
PUBLIC_CLOUDINARY_CLOUD_NAME=
PUBLIC_CLOUDINARY_UPLOAD_PRESET=
PUBLIC_FORMSPREE_ENDPOINT=
```

### Cloudinary

- Crea un `unsigned upload preset`
- Usa tu `cloud name`
- Las imágenes del formulario se subirán primero a Cloudinary y luego sus URLs se enviarán a Formspree

### Formspree

- Crea un formulario en Formspree
- Copia el endpoint tipo `https://formspree.io/f/xxxxx`
- Ese endpoint recibirá todos los campos del cotizador y los links de las imágenes

## Build

```bash
npm run build
```

El proyecto esta preparado como sitio estatico, por lo que puede desplegarse directamente en Vercel sin adaptador extra.

## Despliegue en Vercel

1. Sube este proyecto a un repositorio Git.
2. Importa el repositorio en Vercel.
3. Vercel detectara Astro automaticamente.
4. Usa estos valores si te los pide:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

## Siguiente integracion recomendada

La interfaz ya esta lista para conectar el formulario a:

- Formspree si quieres la opcion mas simple
- Supabase si luego quieres guardar datos e imagenes
- Cloudinary si quieres manejar cargas de imagenes por separado

## Flujo actual de envio

1. El cliente completa el formulario
2. Las imágenes se suben a Cloudinary
3. El formulario envía los datos a Formspree
4. En tu correo llegan los campos del formulario y las URLs de cada imagen
