#!/usr/bin/env bash
# Runs in the browser container at the end of every measured phase and prints how many
# bytes and requests that phase caused, as custom metrics for GMT.
#
# Bytes are what the network interface of the browser container saw, in both directions.
# Requests come from a Playwright listener, which writes its count to /tmp/lab-requests.
set -euo pipefail

STATE=/tmp/lab-zaehler

network_bytes() {
    local total=0 device
    for device in /sys/class/net/*; do
        [[ "$(basename "$device")" == lo ]] && continue
        total=$(( total + $(cat "$device/statistics/rx_bytes") + $(cat "$device/statistics/tx_bytes") ))
    done
    echo "$total"
}

if [[ "${1:-}" == start ]]; then
    network_bytes > "$STATE.bytes"
    echo 0 > "$STATE.requests"
    exit 0
fi

bytes=$(network_bytes)
requests=$(cat /tmp/lab-requests)

echo "$(date +%s%N) lab_bytes=$(( bytes - $(cat "$STATE.bytes") ))"
echo "$(date +%s%N) lab_requests=$(( requests - $(cat "$STATE.requests") ))"

echo "$bytes" > "$STATE.bytes"
echo "$requests" > "$STATE.requests"
