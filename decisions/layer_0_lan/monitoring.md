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

## Constraint Conflict: linuxserver vs PostgreSQL

The project strategy defines two relevant rules:
1. **linuxserver.io images first** — use the linuxserver image when one exists
2. **PostgreSQL first** — if a service supports PostgreSQL, it uses the shared instance

No monitoring tool currently satisfies both. This is an honest conflict that must be resolved.

| Tool | linuxserver image | PostgreSQL backend | Phone notifications |
|------|:-----------------:|:-----------------:|---------------------|
| **Uptime Kuma** | ✅ | ❌ (in development) | ✅ ntfy, Telegram, 90+ channels |
| **Statping-ng** | ❌ | ✅ first-class | ✅ Telegram, Slack, webhook (ntfy via webhook) |
| **Gatus** | ❌ | ❌ (BoltDB only) | Limited |
| **Beszel** | ❌ | ❌ (embedded) | System metrics only — wrong scope |

---

## Candidates

### Uptime Kuma (linuxserver/uptime-kuma)

- linuxserver image ✅
- HTTP, TCP, ping, DNS, keyword, and more monitor types
- Rich notification ecosystem: ntfy, Telegram, Discord, Slack, email, 90+ channels — all configured in UI
- Clean, user-friendly dashboard; active development
- Fits naturally behind a reverse proxy at Layer 1
- **PostgreSQL**: not officially supported. SQLite and MariaDB only. Feature in active upstream development (issues #959, #5674); not merged as of April 2026.

### Statping-ng

- No linuxserver image ❌ — uses own `statping/statping-ng` Docker image
- **PostgreSQL**: first-class support via `DB_DRIVER=postgres`
- HTTP monitoring, status page UI
- Notifications: Telegram, Slack, Discord, webhooks, email, Twilio; ntfy reachable via webhook
- Active development (v0.93.0, June 2025); smaller community than Uptime Kuma

### Gatus / Beszel

Eliminated: Gatus has no PostgreSQL and no linuxserver image. Beszel monitors system metrics (CPU/RAM/disk), not service uptime — wrong tool entirely.

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
- Violating the linuxserver-first rule (no linuxserver image exists)
- Accepting a smaller notification ecosystem (no native ntfy)
- Taking on a smaller-community tool

That is a net loss across three criteria in exchange for PostgreSQL compliance on the least critical dataset. **Uptime Kuma is the correct choice.**

---

## Uptime Kuma SQLite Exception

Explicit, reasoned, and time-limited exception to the PostgreSQL-first strategy:

- **Reason**: PostgreSQL backend not yet available upstream; monitoring data is non-critical; linuxserver image satisfies rule #1
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

- Must run as a Docker container (linuxserver image required)
- Must support push notifications to phone at Layer 0 (outbound only)
- Must be exposable via reverse proxy at Layer 1 without architectural changes

---

## Open Decisions

1. **Notification channel**: ntfy (recommended) vs Telegram — decided at implementation
2. **ntfy hosting**: ntfy.sh at Layer 0; optional self-hosted upgrade at Layer 2

## Status

**Decided: Uptime Kuma (linuxserver/uptime-kuma)**

SQLite is an explicit, reasoned, and time-limited exception to the PostgreSQL-first rule. Statping-ng (PostgreSQL-native) was evaluated and rejected: no linuxserver image, weaker notification ecosystem. Uptime Kuma migrates to the shared PostgreSQL instance when upstream support ships.
