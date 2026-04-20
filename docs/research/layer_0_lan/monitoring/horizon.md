# Monitoring — Horizon

Ideas discussed that are out of scope for Layer 0 but worth capturing.

---

## Prometheus + Grafana

Full metrics stack — Prometheus scrapes metrics endpoints exposed by services; Grafana visualises them.

- Significantly more powerful than Uptime Kuma for capacity planning, resource trending, custom alerting
- Requires services to expose `/metrics` endpoints (or use exporters)
- Two containers minimum (Prometheus + Grafana), plus one exporter per service
- Suitable for Layer 2 or when services grow in number and complexity

When to revisit: more than ~10 services, or need for resource utilisation dashboards (CPU, memory, disk per service).

---

## Public Status Page

Uptime Kuma supports public status pages — a URL you can share to show service health to others. Requires the server to be reachable from the internet (Layer 1+).

---

## Self-hosted ntfy

Running `binwiederhier/ntfy` as a container on the homelab server instead of using ntfy.sh (public):

- Full control over notification topics
- No external dependency
- Trivial to add: single container, one port, no database needed

Candidate for Layer 1 when the server becomes internet-accessible, or for Layer 0 if the user prefers self-hosted notifications.

---

## Alertmanager

Pairs with Prometheus to route alerts to notification channels. Overkill without Prometheus; revisit if Prometheus is added.

---

## Watchdog / Deadman Switch

A monitoring pattern where the monitored service sends a heartbeat to the monitoring service. If the heartbeat stops, an alert fires. Useful for detecting silent failures. Uptime Kuma supports this via the "Push" monitor type.
