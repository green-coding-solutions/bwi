#!/usr/bin/env bash
# Measures the frontend of the current branch with the Green Metrics Tool and prints
# duration, energy, bytes and requests per phase for the Laufzettel.
#
# Usage, from petclinic/frontend: ./gmt-messen.sh
# GMT_DIR points to another GMT checkout. Further arguments go to runner.py.
set -euo pipefail

GMT_DIR="${GMT_DIR:-/workspaces/green-metrics-tool}"
REPO_DIR="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
BRANCH="$(git -C "$REPO_DIR" branch --show-current)"
RUN_NAME="Web-Lab ${BRANCH:-ohne-branch} $(date +%H:%M:%S)"
PSQL=(docker exec -i green-coding-postgres-container psql -p 9573 -U postgres -d green-coding -v ON_ERROR_STOP=1 -v "run_name=$RUN_NAME")

# --dev-cache-build keeps images by service name. Without this line every branch would
# measure the frontend image of the first run. Backend and database stay cached.
docker image rm -f proxy_gmt_run_tmp > /dev/null 2>&1 || true

cd "$GMT_DIR"
if [[ -d .venv ]]; then
    source .venv/bin/activate
else
    source venv/bin/activate
fi

# --dev-no-sleeps drops the baseline and idle minutes of GMT. The phases of the flow stay as they are.
python3 runner.py \
    --name "$RUN_NAME" \
    --uri "$REPO_DIR" \
    --filename petclinic/usage_scenario_frontend.yml \
    --dev-no-system-checks \
    --skip-optimizations \
    --dev-cache-build \
    --dev-no-sleeps \
    "$@"

echo
echo "Ergebnis für $BRANCH"
"${PSQL[@]}" -P footer=off <<'SQL'
SELECT regexp_replace(ps.phase, '^[0-9]+_', '') AS "Phase",
       round(max(ps.value) FILTER (WHERE ps.metric = 'phase_time_syscall_system') / 1e6, 1) AS "Dauer (s)",
       round(coalesce(max(ps.value) FILTER (WHERE ps.metric LIKE 'psu_energy_ac_%_machine'),
                      max(ps.value) FILTER (WHERE ps.metric = 'cpu_energy_rapl_msr_component')) / 1e6, 1) AS "Energie (J)",
       round(max(ps.value) FILTER (WHERE ps.metric = 'custom_lab_bytes') / 1000.0) AS "Bytes (kB)",
       max(ps.value) FILTER (WHERE ps.metric = 'custom_lab_requests') AS "Requests"
FROM phase_stats ps
JOIN runs r ON r.id = ps.run_id
WHERE r.name = :'run_name' AND ps.hidden IS FALSE AND ps.phase NOT LIKE '%[%'
GROUP BY ps.phase
ORDER BY ps.phase;
SQL
echo "Vergleicht immer dieselbe Phase. Dauert sie länger, steigt die Energie schon deshalb."
echo "Im Codespace ist die Energie eine Schätzung. Kleine Unterschiede aus einem Lauf beweisen nichts."
