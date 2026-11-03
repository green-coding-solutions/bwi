# BWI Green Coding Workshop

Code und Codespace für den Green-Coding-Workshop mit der BWI am 17. und 18. November 2026.

## Codespace starten

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/green-coding-solutions/bwi?quickstart=1)

Ein Klick auf den Button startet euren Codespace. Habt ihr schon einen, öffnet der Button ihn wieder. Der Codespace braucht mindestens 4 Kerne und richtet sich beim ersten Start selbst ein. Was danach läuft und wie ihr es benutzt, steht in [.devcontainer/splash.md](.devcontainer/splash.md).

## Was wo liegt

- `.devcontainer/` richtet den Codespace ein. Die Installation des Green Metrics Tool stammt aus dessen eigenem Codespace.
- `kpi-demo/` ist das Energie-Panel aus dem Block „Metriken, KPIs und Dashboards“. Darin laufen node_exporter, Prometheus, Grafana und eine Spring-Boot-App per docker compose.
- `petclinic/` ist die Demo-App aus „Lokale Tools II“ und dem Web-Block. Spring PetClinic REST in mehreren Varianten (`backend/`), ein React-Frontend (`frontend/`), das Lastskript für k6 (`load/`) und die Usage Scenarios für das Green Metrics Tool.
- `gmt-examples/` zeigt im Codespace auf die Beispiel-Anwendungen des Green Metrics Tool. Der Link entsteht beim Einrichten des Codespace.

## Das Energie-Panel auf euren eigenen Server bringen

Das Panel braucht nur node_exporter, Prometheus und Grafana. Übernehmt diese Dateien.

- `kpi-demo/prometheus/rules.yml` mit den beiden Recording Rules
- `kpi-demo/grafana/dashboards/energie-panel.json` als Dashboard

In `rules.yml` stehen drei Annahmen, nämlich 64 Threads im Host, 100 W im Leerlauf und 300 W unter Volllast. Tauscht sie gegen die Werte eures Servertyps. Die 400 g CO2e pro kWh stehen im Dashboard im Panel „Hochgerechnet auf einen Tag“.

Ohne Codespace startet ihr die Demo auf jedem Rechner mit Docker so.

```sh
bash kpi-demo/up.sh
```
