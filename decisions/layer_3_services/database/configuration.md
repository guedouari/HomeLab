# Database — Configuration

## Environment variables

| Variable | Description |
|----------|-------------|
| `POSTGRES_PASSWORD` | Superuser password (required) |
| `POSTGRES_USER` | Superuser name (default: `postgres`) |
| `POSTGRES_DB` | Default database created on first start (default: `postgres`) |
| `PGDATA` | Data directory (default: `/var/lib/postgresql/data`) |

## Compose snippet

```yaml
postgres:
  image: postgres:17
  container_name: postgres
  network_mode: host
  environment:
    - POSTGRES_USER=postgres
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
  volumes:
    - ./data/postgres:/var/lib/postgresql/data
  restart: unless-stopped
```

`network_mode: host` — consistent with the rest of the stack. PostgreSQL listens on `localhost:5432`. Services connect using `localhost` as the host.

## Creating per-service databases

After PostgreSQL starts, run once per service:

```bash
docker exec -it postgres psql -U postgres \
  -c "CREATE USER nextcloud_user WITH PASSWORD 'strong_password';" \
  -c "CREATE DATABASE nextcloud OWNER nextcloud_user;" \
  -c "GRANT ALL PRIVILEGES ON DATABASE nextcloud TO nextcloud_user;"
```

Nextcloud (and other services configured with env vars) handles this automatically on first start via their own init scripts — no manual SQL needed when the env vars are set correctly.

## Backup

```bash
docker exec postgres pg_dumpall -U postgres > backup_$(date +%Y%m%d).sql
```

Covers all databases in the instance. Store in `data/backup/` (the Samba backup share).

## Security note

With `network_mode: host`, PostgreSQL binds to `0.0.0.0:5432`. On a trusted LAN this is acceptable. PostgreSQL still requires authentication (password). To restrict to localhost only, add to `postgresql.conf`:
```
listen_addresses = 'localhost'
```
Or use a bridge network and connect services by container name.
