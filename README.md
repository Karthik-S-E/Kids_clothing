# Kandamma Kids

Premium 3D storefront for an Indian children's clothing brand.

## Run

```bash
npm install
npm run dev
```

## Admin

- Route: `/admin`
- Default password: `kandamma2026`

Products persist in the browser (`localStorage`). Set `VITE_API_URL` to switch the product repository to a REST backend (see `src/lib/productRepository.ts`).

## Brand config

Edit `.env.local` using `.env.example`: WhatsApp number (country code, no `+`), Instagram, Facebook, admin password.
