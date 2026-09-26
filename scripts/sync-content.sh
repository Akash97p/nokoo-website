#!/usr/bin/env bash
# Copies what this site publishes from the desktop repository: the Markdown guides, SECURITY.md,
# the ARC schemas, the logo, and the broker's web UI for the hosted demo. The demo keeps this
# site's own transport (js/api.js) and invented data (js/demo-data.js) in place of the broker's.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP="${NOKOO_DESKTOP_REPO:-$ROOT/../agent-notify}"
if [[ ! -f "$DESKTOP/Nokoo.slnx" ]]; then
  echo "Desktop repository not found at $DESKTOP; set NOKOO_DESKTOP_REPO." >&2
  exit 1
fi

for doc in "$ROOT"/content/docs/*.md; do
  cp "$DESKTOP/docs/$(basename "$doc")" "$doc"
done
cp "$DESKTOP/SECURITY.md" "$ROOT/content/SECURITY.md"
cp "$DESKTOP"/src/Nokoo.Protocol/Schemas/arc-*.schema.json "$ROOT/public/schemas/"
cp "$DESKTOP/assets/branding/an.png" "$ROOT/public/an.png"

demo="$ROOT/public/demo"
keep="$(mktemp -d)"
cp "$demo/index.html" "$demo/js/api.js" "$demo/js/demo-data.js" "$keep/"
rm -rf "$demo"
cp -R "$DESKTOP/src/Nokoo.Api/WebUi/wwwroot" "$demo"
cp "$keep/index.html" "$demo/index.html"
cp "$keep/api.js" "$demo/js/api.js"
cp "$keep/demo-data.js" "$demo/js/demo-data.js"
rm -rf "$keep"
echo "Synced from $DESKTOP. New guides also need an entry in src/lib/docs.ts."
