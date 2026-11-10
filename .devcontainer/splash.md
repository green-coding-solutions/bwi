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
| PetClinic | 8090, 9966 | Startet erst auf Befehl, siehe unten. Port 8090 ist das React-Frontend, 9966 die REST-API. |

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

**Schritt 3. kWh und g CO2e als Stat-Panel.** Das Dashboard „Energie-Panel“ hat alle Panels schon. Neue Panels könnt ihr in Grafana direkt speichern. Schreibt Panel-Titel dabei ohne Umlaute und ohne Zeichen wie „·“. Grafana schickt den Titel mit jeder Abfrage, und der Proxy von Codespaces lehnt solche Abfragen ab.

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

Die Beispiele seht ihr im Explorer im Ordner `gmt-examples`. Jedes Beispiel hat eine `usage_scenario.yml`. Ändert eine davon oder legt eine eigene an und gebt ihren Pfad bei `--filename` an, etwa `--filename "stress/usage_scenario.yml"`.

Das Ergebnis zeigt das Dashboard auf Port 9143. Die Ports 9142 und 9143 müssen öffentlich sein, sonst blockiert der Browser die Anfragen an die API.

## PetClinic

Die Demo-App aus Lokale Tools II ist Spring PetClinic REST mit Postgres und einem React-Frontend. Zum Ausprobieren startet ihr sie so.

```sh
docker compose -f petclinic/compose.yml up -d --build
```

Das Frontend öffnet ihr im Tab „Ports“ über Port 8090. Gemessen wird mit dem Green Metrics Tool.

```sh
cd /workspaces/green-metrics-tool
source .venv/bin/activate
python3 runner.py --name "PetClinic" --uri /workspaces/bwi --filename petclinic/usage_scenario.yml --dev-no-system-checks --skip-optimizations --dev-cache-build
```

Neben `usage_scenario.yml` (JDK 21) liegen die Varianten aus der Java-Liste. Das sind `usage_scenario_jdk25_coh.yml`, `usage_scenario_native.yml`, `usage_scenario_crac.yml` und `usage_scenario_l2cache.yml`. Der erste Lauf baut die Images und dauert einige Minuten länger. Native Image braucht beim Bauen viel Speicher und ist im Codespace nur etwas für Geduldige.

## Web-Lab

Das Vorher-nachher-Lab aus dem Web-Block misst das React-Frontend. `gmt-messen.sh` startet den Lauf und zeigt am Ende pro Phase Dauer, Energie, Bytes und Requests.

```sh
cd petclinic/frontend
npm ci
git switch main
npm run build
./gmt-messen.sh
git switch lab/a-lazy-route
npm run build
./gmt-messen.sh
```

`npm run build` listet die Chunk-Größen. Der erste Lauf baut das Backend und lädt den Browser. Er dauert deshalb einige Minuten länger. Die Branches heißen `lab/a-lazy-route`, `lab/b1-sse`, `lab/b2-visibility`, `lab/c-images` und `lab/d-dependency`. Die Energie ist im Codespace eine Schätzung aus der CPU-Auslastung.

## Wenn etwas hängt

- KPI-Demo neu starten mit `bash kpi-demo/up.sh`
- Green Metrics Tool neu installieren mit `bash .devcontainer/gmt-setup.sh`
- Ports des Green Metrics Tool wieder öffentlich machen mit `gh codespace ports visibility 9142:public 9143:public -c $CODESPACE_NAME`
- Fehlen die Container des Green Metrics Tool, startet sie `docker compose -f /workspaces/green-metrics-tool/docker/compose.yml up -d`
