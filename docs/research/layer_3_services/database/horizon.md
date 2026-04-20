# Database — Horizon

## Adding a second service

Each new Layer 3 service that needs a DB gets its own isolated database on the shared instance:

```bash
docker exec postgres psql -U postgres -c "CREATE USER myservice_user WITH PASSWORD 'strong_pass'"
docker exec postgres psql -U postgres -c "CREATE DATABASE myservice OWNER myservice_user"
```

No new PostgreSQL container is needed — same instance, fully isolated databases.

## pgvector

If a future service (e.g., an AI assistant, semantic search) requires vector embeddings, migrate to `pgvector/pgvector:pg17`. The migration is in-place — data directories are compatible between `postgres:17` and `pgvector/pgvector:pg17`.

## Automated backup

```bash
# /etc/cron.d/homelab-db-backup
0 2 * * * root docker exec postgres pg_dumpall -U postgres \
  > /path/to/data/backup/db_$(date +%Y%m%d).sql
```

Covers all databases. Combined with the Samba `backup` share, backups are accessible from any device on the LAN.

## Connection pooling (PgBouncer)

For services with many short-lived connections (Nextcloud under heavy load), PgBouncer reduces connection overhead. `pgbouncer` image is ~15 MB. Add between the service and PostgreSQL if performance becomes an issue.
