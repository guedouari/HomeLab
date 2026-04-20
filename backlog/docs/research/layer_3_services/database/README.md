# Database (PostgreSQL)

## Role

PostgreSQL is a shared service introduced at Layer 3. It is not added speculatively — it is added here because Nextcloud requires a proper database (SQLite is not recommended beyond single-user/testing).

One shared PostgreSQL instance serves all Layer 3 services that need a relational database. Each service gets its own database and a dedicated user with limited privileges.

## Chosen image

**`postgres:17`** — the official PostgreSQL image.

| Property | Value |
|----------|-------|
| Image | `postgres:17` |
| ARM64 | ✅ |
| Compressed size | ~432 MB |
| Config | Environment variables + optional `postgresql.conf` mount |
| Data dir | `/var/lib/postgresql/data` |

`pgvector/pgvector:pg17` is NOT used — Nextcloud does not require vector extensions. Use plain `postgres:17` unless a confirmed service needs pgvector.

## See also

- [candidates.md](candidates.md)
- [configuration.md](configuration.md)
- [testing.md](testing.md)
