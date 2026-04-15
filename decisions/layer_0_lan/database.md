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

### MariaDB (linuxserver/mariadb)

MySQL-compatible relational database.

| Property | Value |
|----------|-------|
| linuxserver image | ✅ |
| Nextcloud support | ✅ officially recommended |
| Vaultwarden support | ✅ |
| Gitea support | ✅ |
| Immich support | ❌ Immich requires PostgreSQL (pgvector extension) |

### PostgreSQL (linuxserver/postgresql)

Advanced open-source relational database.

| Property | Value |
|----------|-------|
| linuxserver image | ✅ |
| Nextcloud support | ✅ officially supported |
| Vaultwarden support | ✅ |
| Gitea support | ✅ |
| Immich support | ✅ required (needs pgvector) |

---

## Service Compatibility Matrix

| Service | Layer | SQLite | MariaDB | PostgreSQL | Notes |
|---------|-------|:------:|:-------:|:----------:|-------|
| Uptime Kuma | 0 | ✅ built-in (only) | — | ❌ not yet supported | PostgreSQL backend is in development upstream; SQLite is the production option |
| AdGuard Home | 0 | ✅ built-in | — | — | Uses its own storage; no external DB needed |
| Samba | 0 | — | — | — | No database needed |
| Nextcloud | 2 | ⚠️ not for production | ✅ recommended | ✅ supported | SQLite not suitable beyond testing |
| Vaultwarden | 2 | ⚠️ default but migrate | ✅ | ✅ | SQLite is the default; migrate to PostgreSQL per project policy |
| Jellyfin | 2 | ✅ built-in | — | — | No relational DB needed; uses its own internal store |
| Immich | 2 | ❌ | ❌ | ✅ required | Needs pgvector extension |
| Gitea | 2 | ⚠️ small installs but migrate | ✅ | ✅ | SQLite acceptable initially; migrate to PostgreSQL per project policy |

**Key finding:** Immich requires PostgreSQL and cannot use MariaDB. Nextcloud works with both. Choosing MariaDB would force a second database container when Immich is added. Choosing PostgreSQL covers all services with a single instance.

---

## Decision: PostgreSQL

**PostgreSQL is the single shared database server.**

Reasons:
- Only engine that covers all current and planned services (including Immich's pgvector requirement)
- Nextcloud officially supports PostgreSQL — no degraded experience vs MariaDB
- One engine to operate, back up, and understand
- linuxserver image available
- Per-service isolation via separate databases and users

### Instance model

```
postgres (shared container)
├── adguardhome_db / adguardhome_user   (if needed in future)
├── nextcloud_db   / nextcloud_user
├── vaultwarden_db / vaultwarden_user   (if moving off SQLite)
├── immich_db      / immich_user
└── gitea_db       / gitea_user         (if moving off SQLite)
```

Services that have viable built-in SQLite (Vaultwarden small installs, Gitea personal use) **will migrate to PostgreSQL** — the goal is all services on the shared instance. SQLite is a temporary fallback only when PostgreSQL support is genuinely unavailable (e.g., Uptime Kuma currently).

---

## Note on Redis / Valkey

Several Layer 2 services (notably Nextcloud) benefit significantly from a **cache / session store** (Redis or its FOSS fork Valkey). This is a separate concern from the relational database and is not in scope for Layer 0. It will be evaluated when Nextcloud is added at Layer 2.

---

## Constraints

- Must run as a Docker container (linuxserver image required)
- Must be reachable by containers across Docker networks (internal bridge network)
- Must not be exposed outside the Docker network (no published ports)

---

## Open Decisions

1. **pgvector**: confirm linuxserver/postgresql image includes pgvector, or determine how to add it (needed for Immich at Layer 2)
2. **Backup strategy**: how and when to back up the shared instance — decided at implementation

## Status

**Decided: PostgreSQL (linuxserver/postgresql) — single shared instance**

Deployment details and pgvector confirmation remain open until implementation.
