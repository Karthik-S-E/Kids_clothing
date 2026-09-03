# Kandamma Kids

Premium storefront for an Indian children's ethnic-wear brand. Orders are placed
over WhatsApp; the catalogue is managed from a protected admin dashboard and
stored in Firestore.

## Run

```bash
npm install
npm run dev
```

To exercise the AI stylist locally you need the serverless function too, since
`vite dev` does not serve `/api`:

```bash
npx vercel dev
```

## Admin

- Route: `/admin` (deliberately not linked in the public navigation)
- Sign in with a **Firebase Auth** email/password account

There is no public sign-up. Create owner accounts in the Firebase console under
**Authentication → Users**, then add each account's UID to `firestore.rules`.

> The old hardcoded `VITE_ADMIN_PASSWORD` gate has been removed. It ran entirely
> in the browser and could be bypassed by editing localStorage.

## Security

`firestore.rules` makes products and settings publicly readable but restricts
all writes to listed admin UIDs. **Deploy the rules or the dashboard is
effectively open to the internet:**

```bash
firebase deploy --only firestore:rules
```

## Environment

Copy `.env.example` to `.env.local`.

Anything prefixed `VITE_` is inlined into the public browser bundle — never put
a secret behind that prefix.

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_WHATSAPP_NUMBER` | client | Order number, country code, no `+` |
| `VITE_INSTAGRAM_URL` / `VITE_FACEBOOK_URL` | client | Social links |
| `GEMINI_API_KEY` | **server only** | Read by `/api/stylist` |
| `GEMINI_MODEL` | server only | Defaults to `gemini-2.5-flash` |

Set the server-only values in the Vercel dashboard under
**Project → Settings → Environment Variables**.

## AI stylist

The chat widget posts to `/api/stylist` (a Vercel Edge function), which injects
the live Firestore catalogue into the system prompt and calls Gemini. The model
tags recommendations as `{{ID:...}}`; the UI turns those into product cards and
discards any ID that is not actually in the catalogue.

## Product data

Products live in the Firestore `products` collection and stream into the app via
a realtime `onSnapshot` subscription. Brand name/tagline/logo live in
`settings/brand`.

Age ranges are normalised through `src/lib/ageRange.ts`, so legacy values like
`"4-8"`, `"4Y-8Y"` and `"4-8 Years"` all collapse to a single `4-8Y` filter
bucket.

### Known limitation

Uploaded images are canvas-compressed to base64 and written directly into the
Firestore document. Firestore has a hard 1 MB per-document limit, and every
image is re-sent to every visitor on each snapshot. Moving uploads to Firebase
Storage (already configured in the project) is the recommended next step.
