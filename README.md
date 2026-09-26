# Nokoo website

The public site for [nokoo.ai](https://nokoo.ai): the product pages, the documentation, the hosted
web UI demo, and the Relay pricing, privacy, and terms pages. It is a static Next.js export.

- `src/app/` — the pages. `/pricing/`, `/privacy/`, and `/terms/` describe the hosted relay; their
  "Choose a plan" links hand off to the relay's own `/signup` page, which takes payment.
- `content/` — the Markdown the `/docs` pages render, copied from the desktop repository.
- `public/` — the logo, favicons, ARC schemas, and the hosted web UI demo.

## Develop

```bash
npm ci
npm run dev
npm run typecheck
npm run build        # static export in out/
```

## Refresh from the desktop repository

The guides, schemas, logo, and demo are copies. After the desktop repository changes them:

```bash
./scripts/sync-content.sh    # NOKOO_DESKTOP_REPO defaults to ../agent-notify
```

A new guide also needs an entry in `src/lib/docs.ts` to appear in navigation.

## Deploy

Vercel with the Next.js preset (Node 24). Optional environment variables:

- `NEXT_PUBLIC_RELAY_URL` — the hosted relay the pricing page links to (default `https://an.relay.dev.kabanitech.com`);
- `NEXT_PUBLIC_BASE_PATH` — only when serving under a sub-path.

## Licence

Proprietary. © 2026 Kabani Tech Private Limited. All rights reserved.
nokoo.ai is developed by Kabani Tech Private Limited.
