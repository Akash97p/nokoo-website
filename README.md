# AgentNotify site

Static Next.js export of the AgentNotify marketing site and documentation, copied from the
private `agent-notify` repository's `site/` folder so it can be hosted on its own.

- `content/` holds the Markdown the `/docs` pages render.
- `public/` holds the logo, favicons, ARC schemas, and the hosted web UI demo.

Deploy on Vercel with the Next.js preset (Node 24). No environment variables are needed;
set `NEXT_PUBLIC_BASE_PATH` only when serving under a sub-path.
