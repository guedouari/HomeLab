# Database — Candidates

## Selected: pgvector/pgvector:pg17

**Image:** `pgvector/pgvector:pg17` (Docker Hub)
**Digest:** `sha256:494dff7e67e7bc2c826b94c331364978d145ebb86fd338154138b084223b7f67`
**Status:** ✅ Verified

### Why pgvector over plain postgres

| Feature | `postgres:17` | `pgvector/pgvector:pg17` |
|---------|--------------|--------------------------|
| Base image | Official PostgreSQL | Official PostgreSQL + pgvector |
| pgvector extension | Manual install required | ✅ Pre-installed |
| Image size overhead | Baseline | Minimal (~10 MB extra) |
| ARM64 support | ✅ | ✅ |
| Maintenance | PostgreSQL team | pgvector team (very active) |

**Decision:** pgvector adds negligible overhead and removes any future friction when a service needs vector search. If pgvector is never used, the extension simply sits unused.

---

## Alternatives considered

| Image | Reason not selected |
|-------|-------------------|
| `postgres:17` | No pgvector — would require manual extension install or custom Dockerfile |
| `bitnami/postgresql` | Runs as non-root (good), but adds Bitnami wrapper complexity and a different env var schema |
| `linuxserver/postgresql` | Does not exist — no linuxserver Postgres image |
| `timescaledb/timescaledb-ha` | Includes TimescaleDB + pgvector but significantly heavier; overkill without time-series workloads |
