# Monitoring — Candidates

## Selected: Uptime Kuma

**Image:** `louislam/uptime-kuma:2` (Docker Hub)
**Digest:** `sha256:7337368a77873f159435de9ef09567f68c31285ed5f951dec36256c4b267ee44`
**Status:** ✅ Verified

### Why Uptime Kuma

| Feature | Value |
|---------|-------|
| Monitor types | HTTP(s), TCP port, DNS, Ping, Docker container, and more |
| Storage | SQLite (built-in, no external DB needed) |
| ARM64 support | ✅ |
| Web UI | Modern, reactive — no config files needed for monitors |
| Notifications | 90+ channels including ntfy, Telegram, email, Slack |
| Active development | ✅ very active |
| Self-contained | ✅ single container, no sidecars |

### PostgreSQL note

Uptime Kuma v2 does not support PostgreSQL as a backend — SQLite only. This is intentional; the database decision (PostgreSQL for user workloads) is separate from monitoring storage.

### Alternatives considered

| Tool | Reason not selected |
|------|-------------------|
| Prometheus + Grafana | Requires scrape configuration per service, two containers minimum, significant complexity for basic uptime monitoring |
| Healthchecks.io | Push-based (services ping it) — less suitable for a homelab where services don't self-report |
| Zabbix / Nagios | Heavy, legacy-oriented, significant setup overhead |

---

## Notification Channel: ntfy

**ntfy** (`binwiederhier/ntfy`) — self-hosted push notification server.

- Mobile app (Android/iOS) and browser notifications
- Services push to `http://ntfy-server/topic` — no account needed
- Can be run as a second container (out of scope for Layer 0, noted in horizon)
- Layer 0: use ntfy.sh (public, free) or skip notifications until Layer 1

For Layer 0 testing, notification delivery is deferred to the user.
