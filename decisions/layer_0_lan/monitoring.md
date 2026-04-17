# Layer 0 LAN — Monitoring

## Role

Provide visibility into the health and uptime of all running services. Detect and report when a service is down — ideally before users notice, and ideally on a phone regardless of location.

---

## Key Design Consideration: Notifications vs Remote Dashboard

These are two separate concerns with different Layer requirements:

| Concern | How it works | Layer needed |
|---------|-------------|--------------|
| **Phone notifications** | Server pushes outbound to a notification service | **Layer 0** — outbound connections work from LAN |
| **Remote dashboard access** | Browser connects inbound to the monitoring UI | **Layer 1** — requires reverse proxy |

Phone alerts can be fully operational at Layer 0 without any WAN setup. The dashboard simply won't be reachable remotely until Layer 1 — which is acceptable.

---

## Constraint Conflict: PostgreSQL

The project strategy defines a **PostgreSQL-first** rule — if a service supports PostgreSQL, it uses the shared instance. No monitoring tool that is also the strongest overall candidate currently satisfies this. This is an honest conflict that must be resolved.

> **Image verification** — before finalising any service choice, confirm the Docker image exists and document the exact registry path. Pull the image or check the source registry directly; do not rely on documentation that has not been tested.

| Tool | Verified image | PostgreSQL backend | Phone notifications |
|------|---------------|:-----------------:|---------------------|
| **Uptime Kuma** | `louislam/uptime-kuma:2` (Docker Hub + ghcr.io) | ❌ (in development) | ✅ ntfy, Telegram, 90+ channels |
| **Statping-ng** | `statping/statping-ng` (Docker Hub) | ✅ first-class | ✅ Telegram, Slack, webhook (ntfy via webhook) |
| **Gatus** | `twinproduction/gatus` (Docker Hub) | ❌ (BoltDB only) | Limited |
| **Beszel** | `henrygd/beszel` (Docker Hub) | ❌ (embedded) | System metrics only — wrong scope |

---

## Candidates

### Uptime Kuma

- Verified image: `louislam/uptime-kuma:2` (Docker Hub and `ghcr.io/louislam/uptime-kuma:2`) — no linuxserver image exists
- HTTP, TCP, ping, DNS, keyword, and more monitor types
- Rich notification ecosystem: ntfy, Telegram, Discord, Slack, email, 90+ channels — all configured in UI
- Clean, user-friendly dashboard; active development
- Fits naturally behind a reverse proxy at Layer 1
- **PostgreSQL**: not officially supported. SQLite and MariaDB only. Feature in active upstream development (issues #959, #5674); not merged as of April 2026.

### Statping-ng

- Verified image: `statping/statping-ng` (Docker Hub)
- **PostgreSQL**: first-class support via `DB_DRIVER=postgres`
- HTTP monitoring, status page UI
- Notifications: Telegram, Slack, Discord, webhooks, email, Twilio; ntfy reachable via webhook
- Active development (v0.93.0, June 2025); smaller community than Uptime Kuma

### Gatus / Beszel / Checkmk

Eliminated for Layer 0: Gatus has no PostgreSQL backend and limited notifications. Beszel monitors system metrics (CPU/RAM/disk), not service uptime — wrong tool entirely.

**Checkmk** (`checkmk/check-mk-raw`) is noted as a strong future candidate for Layer 1+ — all-in-one uptime, metrics, alerting, and inventory in a single container, scales well across multiple hosts. To be re-evaluated when monitoring becomes a higher priority.

---

## Resolution: Why Uptime Kuma Still Wins

The monitoring tool's data is **uniquely non-critical** compared to every other service in the stack:

| Service | Data lost if DB wiped | Severity |
|---------|----------------------|----------|
| Nextcloud | Files, calendars, contacts | 🔴 Catastrophic |
| Vaultwarden | All passwords | 🔴 Critical |
| Immich | Photo index | 🟠 Significant |
| **Uptime Kuma** | Uptime history graphs | 🟡 Inconvenient |

Uptime history is observability data, not user data. It reconstructs itself simply by running. This makes monitoring the **most defensible SQLite exception** in the entire stack.

Choosing Statping-ng to satisfy the PostgreSQL rule would mean:
- Accepting a smaller notification ecosystem (no native ntfy)
- Taking on a smaller-community tool
- No meaningful gain — monitoring data is the least critical dataset in the stack

That is a net loss across multiple criteria in exchange for PostgreSQL compliance on the least critical dataset. **Uptime Kuma is the correct choice.**

---

## Uptime Kuma SQLite Exception

Explicit, reasoned, and time-limited exception to the PostgreSQL-first strategy:

- **Reason**: PostgreSQL backend not yet available upstream; monitoring data is non-critical; official vendor image `louislam/uptime-kuma:2` verified
- **Migration path**: PostgreSQL support is in active upstream development. When it ships, Uptime Kuma migrates to the shared instance — no tool change needed.
- **Backup**: the SQLite file (`kuma.db`) is a single file, backed up with the container volume — simpler than a pg_dump, acceptable for non-critical observability data.

---

## Notification Channel Options

Phone notifications work at Layer 0 — the server makes outbound connections to a notification relay. No inbound access to the server is required.

| Channel | Self-hosted | Android | iOS | Notes |
|---------|:-----------:|:-------:|:---:|-------|
| **ntfy** | Optional | ✅ | ✅ | Fully FOSS; use ntfy.sh (free) at Layer 0, self-host at Layer 2 if desired |
| **Telegram bot** | ❌ | ✅ | ✅ | Reliable; requires a Telegram account |
| **Email** | Optional | ✅ | ✅ | Universal but requires SMTP config |
| **Gotify** | Required | ✅ | ⚠️ | No official iOS app; self-hosting required |

**Recommended: ntfy**
- FOSS, no account needed with ntfy.sh
- Works on Android and iOS
- Zero setup at Layer 0 using ntfy.sh as the relay
- Can be self-hosted at Layer 2 to make the entire notification path self-contained
- Natively supported in Uptime Kuma

---

## Future Layer Compatibility

| Layer | Monitoring behaviour |
|-------|---------------------|
| **Layer 0 (now)** | Dashboard on LAN only; phone alerts via ntfy fully working |
| **Layer 1** | Dashboard exposed via reverse proxy — remote access, no tool change |
| **Layer 2+** | Monitors Nextcloud, Vaultwarden, Immich, etc. — no tool change |
| **Future** | Migrate to shared PostgreSQL when upstream support ships |

---

## Constraints

- Must run as a Docker container (official vendor image; verified and actively maintained)
- Must support push notifications to phone at Layer 0 (outbound only)
- Must be exposable via reverse proxy at Layer 1 without architectural changes

---

## Open Decisions

1. **Notification channel**: ntfy (recommended) vs Telegram — decided at implementation
2. **ntfy hosting**: ntfy.sh at Layer 0; optional self-hosted upgrade at Layer 2

## Status

**Decided: Uptime Kuma (`louislam/uptime-kuma:2`) — provisional**

No linuxserver image exists for Uptime Kuma. Official image `louislam/uptime-kuma:2` is verified (Docker Hub + ghcr.io). SQLite is an explicit, reasoned, and time-limited exception to the PostgreSQL-first rule. Statping-ng (PostgreSQL-native) was evaluated and rejected: weaker notification ecosystem, smaller community. Uptime Kuma migrates to the shared PostgreSQL instance when upstream support ships.

**To revisit at Layer 1**: Checkmk (`checkmk/check-mk-raw`) is the leading alternative — multi-purpose, single container, scales across hosts and layers without architectural change.
