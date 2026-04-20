# Database — Testing & Verification

**This file is the gate. Status stays 🔍 until every section has a recorded result.**

---

## Environment

| Item | Value |
|------|-------|
| Host OS | Windows 11 + WSL2 (`homelab-test` distro, Ubuntu-based) |
| Docker version | 29.4.0 |
| Image pulled | `pgvector/pgvector:pg17` |
| Image digest | `sha256:494dff7e67e7bc2c826b94c331364978d145ebb86fd338154138b084223b7f67` |
| Date tested | 2025-04 |

---

## Step 1 — Image Pull

| Check | Result | Notes |
|-------|:------:|-------|
| Image pulls without error | ✅ | |
| Multi-arch (amd64 + arm64) | ✅ | |
| Digest recorded | ✅ | `sha256:494dff7e67e7bc2c826b94c331364978d145ebb86fd338154138b084223b7f67` |

---

## Step 2 — Container Starts

```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=testpass \
  pgvector/pgvector:pg17
docker logs postgres --tail 10
```

| Check | Result | Notes |
|-------|:------:|-------|
| Container starts and stays running | ✅ | |
| Logs show `database system is ready to accept connections` | ✅ | |

---

## Step 3 — Connect and Query

```bash
docker exec postgres psql -U postgres -c "SELECT datname FROM pg_database;"
```

| Check | Result | Notes |
|-------|:------:|-------|
| `psql` connects as superuser | ✅ | |
| Default databases listed | ✅ | `postgres`, `template0`, `template1` |

---

## Step 4 — pgvector Extension

```bash
docker exec postgres psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector; SELECT extname, extversion FROM pg_extension WHERE extname='vector';"
```

| Check | Result | Notes |
|-------|:------:|-------|
| `CREATE EXTENSION` succeeds | ✅ | |
| Extension version returned | ✅ | pgvector 0.8.2 |

---

## Step 5 — Create Database and User

```bash
docker exec postgres psql -U postgres -c "CREATE USER testuser WITH PASSWORD 'testpass';"
docker exec postgres psql -U postgres -c "CREATE DATABASE testdb OWNER testuser;"
docker exec postgres psql -U testuser -d testdb -c "SELECT current_database(), current_user;"
```

> **Note:** `CREATE USER` and `CREATE DATABASE` must be sent as separate `-c` calls — they cannot run together in a single transaction block.

| Check | Result | Notes |
|-------|:------:|-------|
| New user and database created | ✅ | |
| Connection as non-superuser works | ✅ | `testdb / testuser` confirmed |

---

## Step 6 — Restart Persistence

```bash
docker restart postgres
docker exec postgres psql -U postgres -c "SELECT datname FROM pg_database;"
```

| Check | Result | Notes |
|-------|:------:|-------|
| Databases persist after restart | ✅ | `testdb` present after restart |

---

## Issues Found

| # | Description | Status | Resolution |
|---|-------------|:------:|-----------|
| 1 | `CREATE USER; CREATE DATABASE` in one `-c` fails (transaction block) | ✅ Documented | Send as separate `psql -c` calls or use init SQL scripts (one statement per `\;`) |

---

## Result

✅ **PASS** — all checks complete.

---

## Step 2 — Container Starts

```bash
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=testpass \
  pgvector/pgvector:pg17
docker logs postgres --tail 10
```

| Check | Result | Notes |
|-------|:------:|-------|
| Container starts and stays running | ⬜ | |
| Logs show `database system is ready to accept connections` | ⬜ | |

---

## Step 3 — Connect and Query

```bash
docker exec -it postgres psql -U postgres -c "\l"
```

| Check | Result | Notes |
|-------|:------:|-------|
| `psql` connects as superuser | ⬜ | |
| Default databases listed | ⬜ | |

---

## Step 4 — pgvector Extension

```bash
docker exec postgres psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector; SELECT extversion FROM pg_extension WHERE extname='vector';"
```

| Check | Result | Notes |
|-------|:------:|-------|
| `CREATE EXTENSION` succeeds | ⬜ | |
| Extension version returned | ⬜ | |

---

## Step 5 — Create Database and User

```bash
docker exec postgres psql -U postgres -c "
  CREATE USER testuser WITH PASSWORD 'testpass';
  CREATE DATABASE testdb OWNER testuser;
"
docker exec postgres psql -U testuser -d testdb -c "SELECT current_database(), current_user;"
```

| Check | Result | Notes |
|-------|:------:|-------|
| New user and database created | ⬜ | |
| Connection as non-superuser works | ⬜ | |

---

## Step 6 — Restart Persistence

```bash
docker restart postgres
docker exec postgres psql -U postgres -c "\l"
```

| Check | Result | Notes |
|-------|:------:|-------|
| Databases persist after restart | ⬜ | |

---

## Issues Found

| # | Description | Status | Resolution |
|---|-------------|:------:|-----------|
| | | | |

---

## Result

⬜ **PASS** — update `README.md` status and `decisions/layer_0_lan.md`
⬜ **FAIL** — record issues, return to `candidates.md` or `configuration.md`
