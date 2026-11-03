#!/usr/bin/env bash
# The Docker daemon in the Codespace starts together with the container and can lag
# behind the lifecycle scripts.
set -euo pipefail

for _ in $(seq 1 60); do
    if docker info > /dev/null 2>&1; then
        exit 0
    fi
    sleep 1
done

echo "Docker did not come up within 60 seconds" >&2
exit 1
