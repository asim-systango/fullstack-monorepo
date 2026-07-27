#!/usr/bin/env bash
# Thin wrappers for common instructor tooling entrypoints.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

case "${1:-}" in
  briefs)
    python3 tools/scripts/generate-detailed-briefs.py "${@:2}"
    ;;
  *)
    echo "Usage: tools/scripts/run.sh briefs"
    exit 1
    ;;
esac
