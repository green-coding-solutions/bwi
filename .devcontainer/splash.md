# BWI Green Coding Workshop

Willkommen im Codespace für den Workshop. Beim ersten Start richtet er sich selbst ein. Das dauert etwa 5 Minuten. Den Fortschritt zeigt die Befehlspalette mit „Codespaces: View Creation Log“.

## Was im Codespace läuft

| Dienst | Port | Wofür |
| --- | --- | --- |
| Grafana | 3000 | Das Energie-Panel. Öffnet sich beim ersten Start in einem neuen Tab. |
| Prometheus | 9090 | Rechnet mit `kpi-demo/prometheus/rules.yml` Auslastung und Watt aus. |
| node_exporter | | Liest die CPU-Zeit des Codespace. |
| Demo-App | 8080 | Spring Boot mit Actuator und Micrometer. |
| Green Metrics Tool | 9142, 9143 | Liegt in `/workspaces/green-metrics-tool`. Das Dashboard ist Port 9143. |

Die Adressen stehen im Tab „Ports“. Grafana fragt nach keinem Login und jede Person mit Zugriff ist Admin. Gebt Port 3000 deshalb nicht öffentlich frei.

## Live-Demo Energie-Panel

**Schritt 1. Auslastung.** In Prometheus auf Port 9090 diese Query eingeben.

```promql
1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m]))
```

**Schritt 2. Watt als Recording Rule.** Die Regeln stehen in `kpi-demo/prometheus/rules.yml`. Die Zahlen 64, 100 und 300 sind die Annahmen für den Host. Nach einer Änderung lädt Prometheus die Regeln so neu.

```sh
curl -X POST localhost:9090/-/reload
```

**Schritt 3. kWh und g CO2e als Stat-Panel.** Das Dashboard „Energie-Panel“ hat alle Panels schon. Neue Panels könnt ihr in Grafana direkt speichern.

**Schritt 4. Last erzeugen und der Kurve zusehen.**

```sh
stress-ng --cpu 2 --timeout 120s
```

Der Wett-Tipp rechnet mit 4 vCPUs. Wie viele der Codespace hat, zeigen `nproc` und das Panel „vCPUs der VM“.

## Pro Request mit Micrometer

Dieser Befehl schickt 3 Minuten lang 50 Requests pro Sekunde an die Demo-App.

```sh
docker compose -f kpi-demo/compose.yml run --rm load
```

Mit `RATE` und `DURATION` ändert ihr Rate und Dauer, etwa `RATE=100 DURATION=5m docker compose -f kpi-demo/compose.yml run --rm load`. Die Panels dazu stehen unten im Energie-Panel.

## Green Metrics Tool

```sh
cd /workspaces/green-metrics-tool
source .venv/bin/activate
python3 runner.py --name "Simple Test" --uri "/workspaces/green-metrics-tool/example-applications/" --filename "stress/usage_scenario.yml" --dev-no-system-checks --skip-optimizations --dev-cache-build
```

Das Ergebnis zeigt das Dashboard auf Port 9143. Die Ports 9142 und 9143 müssen öffentlich sein, sonst blockiert der Browser die Anfragen an die API.

## Wenn etwas hängt

- KPI-Demo neu starten mit `bash kpi-demo/up.sh`
- Green Metrics Tool neu installieren mit `bash .devcontainer/gmt-setup.sh`
- Ports des Green Metrics Tool wieder öffentlich machen mit `gh codespace ports visibility 9142:public 9143:public -c $CODESPACE_NAME`
- Fehlen die Container des Green Metrics Tool, startet sie `docker compose -f /workspaces/green-metrics-tool/docker/compose.yml up -d`
