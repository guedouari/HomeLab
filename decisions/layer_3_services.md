# Layer 3 — Services

This file is the index for Layer 3 decisions.

## Scope

Layer 3 adds user-chosen self-hosted services on top of the Layers 0–2 infrastructure:

- Each service is evaluated independently: real use case? working image? replaces a cloud dependency?
- **No service is added speculatively** — if it hasn't been tested and doesn't serve a clear need, it goes in `horizon.md`
- Services that require a database introduce PostgreSQL at this layer (shared instance, one DB per service)

Layer 3 is a strict superset of Layers 0, 1, and 2.

## Case Study: Replacing Google / Apple Dependency

The primary Layer 3 goal is to evaluate whether Nextcloud (and modules) can replace the major Google/Apple cloud dependencies:

| Cloud service | Self-hosted candidate |
|--------------|----------------------|
| Google Drive / iCloud Files | Nextcloud Files |
| Google Photos / iCloud Photos | Nextcloud Photos or Immich |
| Google Contacts / iCloud Contacts | Nextcloud Contacts |
| Google Calendar / iCloud Calendar | Nextcloud Calendar |
| Google Keep / Apple Notes | Nextcloud Notes |

Each candidate is evaluated on its own merits before being added. Immich is a separate evaluation from Nextcloud — it is not assumed.

## Services Index

| Service | Category | Status |
|---------|----------|--------|
| PostgreSQL | Database (shared) | ✅ Done |
| Redis | Cache + file locking | ✅ Done |
| Nextcloud | Files, contacts, calendar | ✅ Done |
| Immich | Photo management | 🔍 Not yet evaluated — defer until Nextcloud Photos is assessed |

## Open Decisions

1. ~~Is Nextcloud worth running?~~ — yes, confirmed by user
2. ~~PostgreSQL image: plain vs pgvector?~~ — plain `postgres:17` (Nextcloud doesn't need pgvector)
3. Immich vs Nextcloud Photos — evaluate after Nextcloud is deployed; Nextcloud Photos may be sufficient
4. Backup strategy — `pg_dumpall` + volume tar; see `examples/services/README.md`

## Notes on Database

- Introduce PostgreSQL only when a service that needs it is being deployed
- `postgres:17` is the default; pgvector is added only if a confirmed service requires it
- One shared instance, one DB + dedicated user per service
- SQLite remains acceptable for services with no PostgreSQL support
