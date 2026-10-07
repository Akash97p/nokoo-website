# Nokoo website

The public site for [nokooai.kabanitech.com](https://nokooai.kabanitech.com): the product pages, the documentation, the hosted
web UI demo, and the Relay pricing, privacy, and terms pages. It is a static Next.js export.

- `src/app/` — the pages. `/pricing/`, `/privacy/`, and `/terms/` describe the hosted relay; their
  "Choose a plan" links hand off to the relay's own `/signup` page, which takes payment.
- `/download/` hands off to the relay: `/signup?intent=download` makes a free account, and the
  console's Downloads tab serves the installers. `/eula/` renders `content/EULA.txt`, a copy of the
  desktop repository's `EULA.txt` (also served as `/eula.txt`).
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

The guides, schemas, EULA, logo, and demo are copies. After the desktop repository changes them:

```bash
./scripts/sync-content.sh    # NOKOO_DESKTOP_REPO defaults to ../agent-notify
```

A new guide also needs an entry in `src/lib/docs.ts` to appear in navigation.

## Deploy

The site is a static export served by Caddy on the same VPS as the hosted relay; Vercel is no
longer used. From a machine with SSH access to the VPS:

```bash
NOKOO_SITE_SSH=ubuntu@51.161.152.253 ./scripts/deploy-vps.sh
```

It builds `out/`, unpacks it into a new `/srv/nokoo-website/releases/<time>-<commit>` and swaps
`/srv/nokoo-website/current` to it in one rename, keeping five releases for rollback. Caddy's site
block for `nokooai.kabanitech.com` lives in the relay repository's `deploy/vps/Caddyfile`.

Build-time environment variables:

- `NEXT_PUBLIC_RELAY_URL` — the hosted relay the account and pricing pages talk to (default `https://nokooai.relay.kabanitech.com`);
- `NEXT_PUBLIC_BASE_PATH` — only when serving under a sub-path.

## Licence

Proprietary. © 2026 Kabani Tech Private Limited. All rights reserved.
nokoo.ai is developed by Kabani Tech Private Limited.
