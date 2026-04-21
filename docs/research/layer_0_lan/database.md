# Layer 0 LAN — Database Server

## Role

Provide a shared relational database server that all services across all layers can connect to. Provisioned at Layer 0 as infrastructure — even though no Layer 0 service strictly requires it, having it ready means Layer 2 services (Nextcloud, etc.) simply create a database and connect, with no new infrastructure to spin up.

---

## Why a Shared Server at Layer 0

Each service could bring its own database sidecar container. This is common in Docker setups but has real costs at home-lab scale:

| Approach | Containers | Resource use | Backup story | Consistency |
|----------|:----------:|:------------:|:------------:|:-----------:|
| Per-service DB sidecars | 1 DB per service | High (RAM per instance) | Backup each container separately | Different versions, configs |
| **Shared DB server** | 1 instance total | Low (one engine shared) | One backup target | Uniform version and config |

For a home server where RAM is a real constraint (Raspberry Pi, Steam Machine running games), one shared database instance is the right call. Each service gets its own **database and dedicated user** — isolation is preserved at the credential level, not the container level.

---

## Candidates

> **Image verification** — before finalising any service choice, confirm the Docker image exists and document the exact registry path. Pull the image or check the source registry directly; do not rely on documentation that has not been tested.

### MariaDB (`lscr.io/linuxserver/mariadb`)

MySQL-compatible relational database.

| Property | Value |
|----------|-------|
| Verified image | `lscr.io/linuxserver/mariadb` ✅ (linuxserver, actively maintained) |
| Nextcloud support | ✅ officially recommended |
| Vaultwarden support | ✅ |
| Gitea support | ✅ |

### PostgreSQL (`postgres:17`)

Advanced open-source relational database.

| Property | Value |
|----------|-------|
| Verified image | `postgres:17` ✅ (Docker Official Image) |
| Nextcloud support | ✅ officially supported |
| Vaultwarden support | ✅ |
| Gitea support | ✅ |

---

## Service Compatibility Matrix

| Service | Layer | SQLite | MariaDB | PostgreSQL | Notes |
|---------|-------|:------:|:-------:|:----------:|-------|
| AdGuard Home | 0 | ✅ built-in | — | — | Uses its own storage; no external DB needed |
| Samba | 0 | — | — | — | No database needed |
| Nextcloud | 2 | ⚠️ not for production | ✅ recommended | ✅ supported | SQLite not suitable beyond testing |
| Vaultwarden | 2 | ⚠️ default but migrate | ✅ | ✅ | SQLite is the default; migrate to PostgreSQL per project policy |
| Gitea | 2 | ⚠️ small installs but migrate | ✅ | ✅ | SQLite acceptable initially; migrate to PostgreSQL per project policy |

**Key finding:** Nextcloud and future Layer 3 services (Vaultwarden, Gitea) all support PostgreSQL. Choosing a single shared PostgreSQL instance eliminates per-service database sidecars and gives one backup target.

---

## Decision: PostgreSQL

**PostgreSQL is the single shared database server.**

Reasons:
- Only engine that covers all current and planned services
- Nextcloud officially supports PostgreSQL — no degraded experience vs MariaDB
- One engine to operate, back up, and understand
- `postgres:17` official image — Verified Publisher on Docker Hub, multi-arch (AMD64 + ARM64)
- Per-service isolation via separate databases and users

### Instance model

```
postgres (shared container)
├── nextcloud_db   / nextcloud_user
├── vaultwarden_db / vaultwarden_user   (if moving off SQLite)
└── gitea_db       / gitea_user         (if moving off SQLite)
```

Services that have viable built-in SQLite (Vaultwarden small installs, Gitea personal use) **will migrate to PostgreSQL** — the goal is all services on the shared instance. SQLite is a temporary fallback only when PostgreSQL support is genuinely unavailable (e.g., Uptime Kuma currently).

---

## Note on Redis / Valkey

Several Layer 2 services (notably Nextcloud) benefit significantly from a **cache / session store** (Redis or its FOSS fork Valkey). This is a separate concern from the relational database and is not in scope for Layer 0. It will be evaluated when Nextcloud is added at Layer 2.

---

## Constraints

- Must run as a Docker container (official vendor image; verified and actively maintained)
- Must be reachable by containers across Docker networks (internal bridge network)
- Must not be exposed outside the Docker network (no published ports)

---

## Open Decisions

1. **Backup strategy**: how and when to back up the shared instance — decided at implementation

## Status

**Decided: PostgreSQL (`postgres:17`) — single shared instance**

Official `postgres:17` from Docker Hub — Verified Publisher, multi-arch (AMD64 + ARM64). Plain PostgreSQL is sufficient; no extensions needed for current services.
