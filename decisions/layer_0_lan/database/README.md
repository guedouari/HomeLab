# Database — Decision Index

## Role

Provide a shared PostgreSQL instance for services that require a relational database:
1. **Shared instance** — multiple databases, one per service, on a single Postgres process
2. **pgvector extension** — enables vector similarity search for AI/ML workloads without a separate vector DB
3. **LAN-internal only** — no published ports to the host; only services on the same Docker network connect

Not all Layer 0 services need a database. Uptime Kuma uses SQLite. This instance is for services that explicitly require PostgreSQL (e.g., Gitea, Nextcloud, Authentik at higher layers).

---

## Status

✅ **Verified** — `pgvector/pgvector:pg17` tested and passing. See [testing.md](testing.md) for results.

**Selected image:** `pgvector/pgvector:pg17` (Docker Hub)
**Digest:** `sha256:494dff7e67e7bc2c826b94c331364978d145ebb86fd338154138b084223b7f67`

---

## Sections

| File | Contents |
|------|----------|
| [candidates.md](candidates.md) | Image candidates, verification status |
| [networking.md](networking.md) | Docker networking, internal-only access |
| [configuration.md](configuration.md) | Init scripts, user/database creation, env vars |
| [testing.md](testing.md) | Verification checklist and results — gate for finalising status |
| [horizon.md](horizon.md) | Out-of-scope ideas: connection pooling, backups, HA |

---

## Constraints

- PostgreSQL 17 (current stable)
- pgvector pre-installed (no separate extension management needed)
- ARM64 image required (Raspberry Pi target)
- No published ports — internal Docker network only
- Credentials via environment variables / `.env`
