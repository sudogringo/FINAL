#!/usr/bin/env bash
# Export all n8n workflows to JSON files for version control.
# Usage: ./n8n/export-workflows.sh
# Requires: n8n running at localhost:4343

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env"
OUT_DIR="$SCRIPT_DIR/workflows"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: $ENV_FILE not found" >&2
  exit 1
fi

API_KEY="$(grep '^API_KEY=' "$ENV_FILE" | cut -d= -f2-)"
BASE_URL="http://localhost:4343/api/v1"

mkdir -p "$OUT_DIR"

# Fetch all workflows
WORKFLOWS=$(curl -sf -H "X-N8N-API-KEY: $API_KEY" "$BASE_URL/workflows")
if [[ -z "$WORKFLOWS" ]]; then
  echo "ERROR: could not reach n8n API — is n8n running?" >&2
  exit 1
fi

TMPFILE=$(mktemp)
echo "$WORKFLOWS" > "$TMPFILE"

COUNT=$(python3 -c "import json; print(len(json.load(open('$TMPFILE'))['data']))")
echo "Found $COUNT workflows"

OUT_DIR="$OUT_DIR" python3 <<PYEOF
import json, os, re

with open("$TMPFILE") as f:
    data = json.load(f)["data"]

out_dir = os.environ.get("OUT_DIR", "workflows")

for wf in data:
    safe = re.sub(r'[^a-zA-Z0-9_\-]', '_', wf["name"]).strip('_')
    filename = f"{wf['id']}_{safe}.json"
    path = os.path.join(out_dir, filename)

    for field in ("updatedAt", "createdAt", "versionId"):
        wf.pop(field, None)

    with open(path, "w") as f:
        json.dump(wf, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"  v {filename}")

os.unlink("$TMPFILE")
PYEOF
