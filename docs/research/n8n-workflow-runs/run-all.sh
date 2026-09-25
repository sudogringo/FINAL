#!/usr/bin/env bash
# Runs each functional n8n workflow (except 00, measured in quote-latency/) N times
# through the n8n CLI inside the running container, saving one log per run.
# Side effects are real: Gmail sends and Google Sheets writes from the TESIS branches.
set -u
cd "$(dirname "$0")"
RUNS="${RUNS:-3}"
CONTAINER="${CONTAINER:-golden_harvest_n8n}"
# The running instance already holds the task broker port (5679); the CLI process needs its own.
BROKER_PORT="${BROKER_PORT:-5690}"
mkdir -p results

WORKFLOWS=(
  "01:Yvoc3v8PN45TaRAD"
  "02:7zorYUSLKel4UkbC"
  "03:GqIUYIEcOhioWBfY"
  "04:Zpr1rt5YATfQix0d"
  "05:HFEJaY3iBpcBwVek"
  "06a:hcUaHpeXUYfqQMkK"
  "06b:V94be0IzqzlUnAyL"
  "07:pIlvvd0nTN7mfJOL"
)

echo "workflow,run,exit_code,duration_ms" > results/runs.csv
for entry in "${WORKFLOWS[@]}"; do
  wf="${entry%%:*}"; id="${entry##*:}"
  for n in $(seq 1 "$RUNS"); do
    start=$(date +%s%3N)
    docker exec -e N8N_RUNNERS_BROKER_PORT="$BROKER_PORT" "$CONTAINER" \
      n8n execute --id "$id" --rawOutput > "results/$wf-$n.log" 2>&1
    code=$?
    echo "$wf,$n,$code,$(( $(date +%s%3N) - start ))" >> results/runs.csv
    echo "$wf run $n: exit $code"
    sleep 5
  done
done
node summarize.mjs
