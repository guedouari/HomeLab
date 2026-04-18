# Monitoring — Decision Index

## Role

Provide uptime and health monitoring for all homelab services:
1. **Service uptime tracking** — monitors HTTP endpoints, TCP ports, DNS, and more
2. **Visual status dashboard** — single-pane view of all services
3. **Notifications** — alert when a service goes down (ntfy, email, etc.)
4. **History** — uptime graphs and incident log per service

Runs on the homelab server; no external infrastructure required.

---

## Status

✅ **Verified** — `louislam/uptime-kuma:2` tested and passing. See [testing.md](testing.md) for results.

**Selected image:** `louislam/uptime-kuma:2` (digest `sha256:7337368a77873f159435de9ef09567f68c31285ed5f951dec36256c4b267ee44`)

---

## Sections

| File | Contents |
|------|----------|
| [candidates.md](candidates.md) | Image candidates, verification status |
| [networking.md](networking.md) | Docker networking modes, port considerations |
| [configuration.md](configuration.md) | Storage, notification channels, monitor setup |
| [testing.md](testing.md) | Verification checklist and results — gate for finalising status |
| [horizon.md](horizon.md) | Out-of-scope ideas: Prometheus/Grafana, public status pages |

---

## Constraints

- Must monitor HTTP, TCP, DNS service types
- SQLite storage only (PostgreSQL not supported upstream in Uptime Kuma v2)
- Must survive container restarts with history intact
- ARM64 image required (Raspberry Pi target)
- Web UI must be reachable on the LAN without additional proxy at Layer 0

---

## Horizon

Out-of-scope ideas captured during discussion → [horizon.md](horizon.md)
