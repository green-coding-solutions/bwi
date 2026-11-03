#!/usr/bin/env bash
# Runs once when the Codespace is created. The KPI demo comes first because it is
# ready in about a minute. The GMT install takes a few minutes more.
set -euxo pipefail

cd "$(dirname "$0")/.."

# The Yarn repo in the universal image has no valid key, so apt-get update fails.
# Nothing here needs Yarn from apt.
sudo rm -f /etc/apt/sources.list.d/yarn.list

sudo timeout 180 apt-get update
sudo apt-get -o Acquire::http::ConnectTimeout=10 -o Acquire::https::ConnectTimeout=10 install -y acl stress-ng

bash .devcontainer/wait-for-docker.sh
bash kpi-demo/up.sh --build

bash .devcontainer/gmt-setup.sh
