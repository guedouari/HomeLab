# Database — Configuration

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `POSTGRES_USER` | Superuser username | `postgres` |
| `POSTGRES_PASSWORD` | Superuser password | *(required, no default)* |
| `POSTGRES_DB` | Default database created on init | `postgres` |
| `TZ` | Timezone | From `.env` |

Set in `.env`:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme
```

---

## Per-Service Databases

Each service gets its own database and dedicated user. Use init scripts in `./config/postgres/initdb.d/` — all `.sql` and `.sh` files in that directory are executed in filename order on first start.

Example init script (`./config/postgres/initdb.d/01-create-databases.sql`):
```sql
-- Create a dedicated user + database for each service
CREATE USER gitea WITH PASSWORD 'changeme';
CREATE DATABASE gitea OWNER gitea;

CREATE USER nextcloud WITH PASSWORD 'changeme';
CREATE DATABASE nextcloud OWNER nextcloud;
```

The superuser (`POSTGRES_USER`) is used only for administration.

---

## pgvector

The extension is pre-installed in the image. Enable it in any database:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

After enabling, create vector columns:
```sql
CREATE TABLE items (id SERIAL, embedding vector(1536));
```

---

## Volumes

| Host path | Container path | Purpose |
|-----------|---------------|---------|
| `./data/postgres` | `/var/lib/postgresql/data` | Database files (PGDATA) |
| `./config/postgres/initdb.d` | `/docker-entrypoint-initdb.d` | Init scripts (first-run only) |

**Important:** init scripts only run when `PGDATA` is empty (first start). To re-run them, delete `./data/postgres` and recreate the container.

---

## Backup

Minimal backup at Layer 0:
```bash
docker exec postgres pg_dumpall -U postgres > backup.sql
```

Restore:
```bash
docker exec -i postgres psql -U postgres < backup.sql
```

Full volume backup (offline): stop the container and copy `./data/postgres`.
