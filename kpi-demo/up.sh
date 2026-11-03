#!/usr/bin/env bash
# Starts the KPI demo and makes the Energie-Panel the start page of Grafana.
# Grafana can only set a home dashboard by path, and that creates a second copy.
# The org preference points to the provisioned dashboard instead.
set -euo pipefail

cd "$(dirname "$0")"

docker compose up -d "$@"

for _ in $(seq 1 60); do
    if curl -sf localhost:3000/api/health > /dev/null; then
        curl -sf -X PUT localhost:3000/api/org/preferences \
            -H 'Content-Type: application/json' \
            -d '{"homeDashboardUID": "energie-panel"}' > /dev/null
        echo "Grafana is up with the Energie-Panel as start page"
        exit 0
    fi
    sleep 1
done

echo "Grafana did not come up within 60 seconds" >&2
exit 1
