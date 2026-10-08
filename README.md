# AXIOM

Frontend competition landing page for **AXIOM** — an AI coding assistant preview.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- lucide-react
- Local i18n: Тоҷикӣ (`tg`), Русский (`ru`), English (`en`)

No API keys, backend, or paid services.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deploy (static)

Build output is `dist/`.

### Vercel

1. Import the repository (or run `npx vercel` from this folder).
2. Framework preset: Vite (or Other).
3. Build command: `npm run build`
4. Output directory: `dist`
5. `vercel.json` already rewrites SPA routes to `index.html`.

### Netlify

1. New site from Git (or drag-and-drop the `dist` folder after build).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. `public/_redirects` is copied into `dist` for SPA fallback.

You publish the site yourself — this repo does not run deploy commands.
