# Kandamma Kids

Premium ethnic wear storefront for Indian children's clothing.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, Zustand
- **Backend / DB:** Firebase Firestore (real-time)
- **Auth:** Firebase Auth (email/password for admin)
- **Hosting:** Vercel (SPA + serverless API)
- **AI Stylist:** Gemini 2.5 Flash via a Vercel serverless function

## Quick start

```bash
npm install
npm run dev
```

## Environment variables

### Client (Vite `VITE_*`)

| Key | Description |
|---|---|
| `VITE_WHATSAPP_NUMBER` | WhatsApp business number (country code, no `+`). Defaults to `919901200520`. |
| `VITE_INSTAGRAM_URL` | Instagram profile URL. |
| `VITE_FACEBOOK_URL` | Facebook page URL. |

> Do **not** put any secret keys in `VITE_*` variables — they are inlined into the browser bundle.

### Server-only (Vercel)

| Key | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key, used by `api/stylist.ts`. Never exposed to the client. |

Set server-only variables in **Vercel Dashboard → Settings → Environment Variables**, or with:

```bash
freebuff-deploy env set '{"GEMINI_API_KEY":"your-key-here"}'
```

## Admin authentication

Admin login uses **Firebase Auth email/password**. Create an admin user in the Firebase Console:

1. Go to **Firebase Console → Authentication → Users → Add user**
2. Enter an email and strong password
3. Sign in at `/admin/login` with those credentials

Only the Firebase Auth UID `q4aCJhwF93hB4eOLUnlFgNbYvy03` may write to Firestore (products, settings). See `firestore.rules`.

## Firestore security rules

Deploy rules **after** verifying your admin login works:

```bash
# Preview rules locally first
firebase emulators:start

# Then deploy to production
firebase deploy --only firestore:rules
```

Rules grant:
- **Public read** on `products` and `settings`
- **Admin-only write** (UID `q4aCJhwF93hB4eOLUnlFgNbYvy03`)
- **Deny all** for everything else

## Image uploads

Product images are compressed client-side and stored as base64 strings directly in Firestore documents. This is quick to build but hits the **1 MB per-document limit** with large images. The proper fix is Firebase Storage with a data migration — planned for a future iteration.

## Deployment

Vercel deploys automatically from the main branch. The build produces static output in `dist/`. The `api/` directory contains a serverless function that proxies Gemini API calls.

```bash
# Check deploy readiness
freebuff-deploy check

# Deploy
freebuff-deploy start
```
