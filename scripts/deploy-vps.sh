#!/usr/bin/env bash
# Builds the static export and publishes it to the VPS that also runs the relay, where Caddy serves
# /srv/nokoo-website/current for nokooai.kabanitech.com.
#
#   NOKOO_SITE_SSH=ubuntu@51.161.152.253 ./scripts/deploy-vps.sh
#
# Each deploy is unpacked into its own release directory and then swapped in with one symlink
# rename, so a visitor never sees half a site. The last five releases are kept for a quick rollback:
#   ssh $NOKOO_SITE_SSH 'ln -sfn /srv/nokoo-website/releases/<older> /srv/nokoo-website/current'
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${NOKOO_SITE_SSH:?Set NOKOO_SITE_SSH, e.g. ubuntu@51.161.152.253}"
SITE_DIR="${NOKOO_SITE_DIR:-/srv/nokoo-website}"
export NEXT_PUBLIC_RELAY_URL="${NEXT_PUBLIC_RELAY_URL:-https://nokooai.relay.kabanitech.com}"

cd "$ROOT"
rm -rf out
npm run build
release="$(date -u +%Y%m%d%H%M%S)-$(git rev-parse --short HEAD)"
tar -C out -czf - . | ssh "$TARGET" "set -e
  mkdir -p '$SITE_DIR/releases/$release'
  tar -xzf - -C '$SITE_DIR/releases/$release'
  ln -sfn '$SITE_DIR/releases/$release' '$SITE_DIR/current.next'
  mv -T '$SITE_DIR/current.next' '$SITE_DIR/current'
  ls -1dt '$SITE_DIR'/releases/* | tail -n +6 | xargs -r rm -rf"
echo "Published $release to $TARGET:$SITE_DIR/current"
