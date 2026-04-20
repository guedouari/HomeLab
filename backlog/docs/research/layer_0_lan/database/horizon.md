# Database — Horizon

Ideas discussed that are out of scope for Layer 0 but worth capturing.

---

## Connection Pooling (PgBouncer)

At high connection counts, PostgreSQL spawns a process per connection — expensive. PgBouncer sits between services and Postgres and multiplexes connections.

When to revisit: more than ~20 concurrent connections, or when connection overhead becomes measurable. A single-household homelab with a handful of services is unlikely to hit this threshold.

---

## Automated Backups

Layer 0 backup is manual (`pg_dumpall`). For Layer 1+:

- `prodrigestivill/postgres-backup-local` — daily dumps to a local directory, configurable retention
- Offsite: copy dumps to a mounted NAS share (Samba) or cloud storage

---

## High Availability / Streaming Replication

Postgres supports streaming replication to standby nodes. Relevant only when the homelab has multiple physical nodes and data loss matters. Out of scope for a single-node Layer 0 setup.

---

## Read Replicas

Route read-heavy queries to a replica. Same caveat as HA — single-node setups don't benefit.

---

## pgAdmin / DBeaver

Web-based GUI for database administration. Can be added as a container on `homelab-net`:
- `dpage/pgadmin4` — full-featured, runs on port 5050
- Alternatively, connect DBeaver (desktop client) via SSH tunnel to avoid publishing port 5432

---

## TimescaleDB

Time-series extension for PostgreSQL. Useful for storing metrics, sensor data, or telemetry. If Prometheus is added (see monitoring horizon), TimescaleDB can replace Prometheus's TSDB for longer retention.

---

## Separate Vector Database

If pgvector proves insufficient (very large vector datasets, approximate nearest-neighbor at scale), alternatives include:
- `qdrant/qdrant` — purpose-built vector DB, REST + gRPC API
- `chromadb/chroma` — lightweight, Python-native
Revisit only if pgvector query latency becomes a bottleneck.
