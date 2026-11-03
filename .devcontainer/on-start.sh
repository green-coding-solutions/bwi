#!/usr/bin/env bash
# Runs on every start of the Codespace, also after it was stopped.
set -euo pipefail

cd "$(dirname "$0")/.."

etc_hosts_line_1="127.0.0.1 green-coding-postgres-container"

echo "Writing to /etc/hosts file..."

# Entry 1 is needed for the local resolution of the containers through the jobs.py and runner.py
if ! sudo grep -Fxq "$etc_hosts_line_1" /etc/hosts; then
    echo "$etc_hosts_line_1" | sudo tee -a /etc/hosts
else
    echo "Entry was already present..."
fi

bash .devcontainer/wait-for-docker.sh

bash kpi-demo/up.sh

GMT_COMPOSE=/workspaces/green-metrics-tool/docker/compose.yml
if [[ -f "$GMT_COMPOSE" ]]; then
    docker compose -f "$GMT_COMPOSE" up -d

    # Ensure that after a restart of the Codespace the ports are set to public again
    gh codespace ports visibility 9142:public -c "$CODESPACE_NAME" || echo "Could not make port 9142 public. See .devcontainer/splash.md"
    gh codespace ports visibility 9143:public -c "$CODESPACE_NAME" || echo "Could not make port 9143 public. See .devcontainer/splash.md"
fi
