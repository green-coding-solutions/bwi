#!/usr/bin/env bash
# Installs the Green Metrics Tool next to the workshop repo.
# Taken from .devcontainer/codespace-setup.sh in the GMT repo. Only the paths differ
# and VHost_Ratio follows the vCPUs of this Codespace.
set -euxo pipefail

# The GMT installer needs USER, which lifecycle scripts do not always get
export USER="${USER:-$(id -un)}"

GMT_DIR=/workspaces/green-metrics-tool

if [[ ! -d "$GMT_DIR" ]]; then
    # /workspaces can belong to root outside of Codespaces, e.g. with the devcontainer CLI
    sudo install -d -o "$(id -u)" -g "$(id -g)" "$GMT_DIR"
    git clone https://github.com/green-coding-solutions/green-metrics-tool.git --depth=1 --single-branch "$GMT_DIR"
fi
cd "$GMT_DIR"

sudo setfacl -bk /tmp

./install_linux.sh -p testpw -a "https://${CODESPACE_NAME}-9142.app.github.dev" -m "https://${CODESPACE_NAME}-9143.app.github.dev" -T -I -S -L -z -Z -f -j -g -d --tz Europe/Berlin --disable-path-security --no-elephant --no-software-view

source .venv/bin/activate

# Also add XGBoost, as we need it
python3 -m pip install -r metric_providers/psu/energy/ac/xgboost/machine/model/requirements.txt

# make edits to ports so we can use 9143 to access front end
sed -i 's/listen \[::\]:9142;/listen [::]:9143;/; s/listen 9142;/listen 9143;/' docker/nginx/frontend.conf
sed -i 's/- 9142:9142/- 9142:9142\n      - 9143:9143/' docker/compose.yml

# the URLs on the javascript side are ok. But through the proxy tunnel the perceived hostname only localhost
sed -i "s#${CODESPACE_NAME}-9143.app.github.dev#localhost#" docker/nginx/frontend.conf
sed -i "s#${CODESPACE_NAME}-9142.app.github.dev#localhost#" docker/nginx/api.conf

# activate XGBoost provider. The host is the same as in the KPI deck with 64 threads
# and this Codespace gets its vCPUs out of them.
vhost_ratio=$(awk "BEGIN { print $(nproc) / 64 }")
sed -i "s/common:/common:\n      psu_energy_ac_xgboost_machine:\n        CPUChips: 1\n        HW_CPUFreq: 2800\n        CPUCores: 32\n        CPUThreads: 64\n        TDP: 270\n        HW_MemAmountGB: 256\n        VHost_Ratio: ${vhost_ratio}\n/" config.yml

# The network provider runs as the codespace user and cannot open the network namespace
# of the root containers in the nested Docker. Every run would fail on it.
sed -i "/^      network_io_cgroup_container:/,+1 s/^/#/" config.yml

git clone https://github.com/green-coding-solutions/example-applications.git --depth=1 --single-branch example-applications || true

docker compose -f docker/compose.yml down

docker compose -f docker/compose.yml up -d

gh codespace ports visibility 9142:public -c "$CODESPACE_NAME" || echo "Could not make port 9142 public. See .devcontainer/splash.md"
gh codespace ports visibility 9143:public -c "$CODESPACE_NAME" || echo "Could not make port 9143 public. See .devcontainer/splash.md"
