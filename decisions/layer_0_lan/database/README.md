# Database — Decision Index

## Status

⬛ **Out of scope for Layer 0.**

No Layer 0 service (Samba, AdGuard Home, Uptime Kuma) requires a relational database. PostgreSQL is introduced at Layer 3 when a specific service that needs it is being deployed.

See [decisions/layer_3_services.md](../../layer_3_services.md) for the database decision context.

---

## When this folder becomes active

When the first Layer 3 service requiring PostgreSQL is being evaluated, this folder will be completed with:
- Image selection (`postgres:17` vs `pgvector/pgvector:pg17` — decided based on confirmed service requirements)
- Networking (internal bridge, no published ports)
- Init scripts for per-service databases
- Testing checklist

The testing already performed (`pgvector/pgvector:pg17` verified, digest recorded) is preserved in [testing.md](testing.md) as a reference.

