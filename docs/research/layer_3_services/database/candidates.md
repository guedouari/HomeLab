# Database — Candidate Evaluation

## Context

A database is introduced at Layer 3 because Nextcloud explicitly recommends against SQLite for any real use. The choice is which PostgreSQL image to use, not whether to use PostgreSQL.

## Candidates

| Image | Size | Notes |
|-------|------|-------|
| `postgres:17` | 432 MB | Official, plain PostgreSQL |
| `pgvector/pgvector:pg17` | ~445 MB | Adds vector extension — needed only for AI/embedding use cases |
| `mariadb:11` | ~385 MB | MySQL-compatible; Nextcloud supports it, but PostgreSQL is the better long-term choice |
| `postgres:17-alpine` | ~230 MB | Alpine-based, smaller but less tested for production |

## Decision: `postgres:17`

**Why not pgvector:** No confirmed service in this homelab requires vector embeddings. Adding pgvector speculatively violates the "evaluate before committing" principle.

**Why not MariaDB:** PostgreSQL is the better long-term choice for a shared instance — stronger ACID guarantees, better JSON support, more standard SQL. Nextcloud supports both but recommends PostgreSQL.

**Why not alpine variant:** The Alpine PostgreSQL image occasionally has locale/encoding issues on first run. Official Debian-based `postgres:17` is more reliable for a shared homelab instance.

## Per-service database pattern

One instance, isolated databases:

```sql
CREATE USER nextcloud_user WITH PASSWORD 'strong_password';
CREATE DATABASE nextcloud OWNER nextcloud_user;
GRANT ALL PRIVILEGES ON DATABASE nextcloud TO nextcloud_user;
```

Repeat for each service added. Backup is a single `pg_dumpall` covering all databases.
