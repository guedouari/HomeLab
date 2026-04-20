# Database — Networking

## Design: Internal-Only

PostgreSQL is not published to the host network. It is only reachable from other containers on the same Docker Compose internal network.

```
[Samba]     [AdGuard Home]   [Uptime Kuma]
  host mode    host mode        bridge
                                    |
                               [homelab-net]  ← internal bridge network
                                    |
                             [postgres:5432]  ← no host port published
```

---

## Docker Network

A named internal bridge network (`homelab-net`) connects services that need database access. Services that only need host-level access (Samba, AdGuard Home) remain in host mode and do not join this network.

```yaml
networks:
  homelab-net:
    driver: bridge
```

Services needing the database declare:
```yaml
networks:
  - homelab-net
```

PostgreSQL itself only joins `homelab-net` — no `ports` mapping, no host exposure.

---

## Connecting from a service container

Connection string pattern:
```
postgresql://POSTGRES_USER:POSTGRES_PASSWORD@postgres:5432/database_name
```

The hostname `postgres` resolves via Docker's internal DNS within `homelab-net`.

---

## Why no host port?

Publishing port 5432 to the host exposes the database to the LAN. For Layer 0 (LAN baseline), no service needs direct LAN access to PostgreSQL — only containers need it. A published port would be an unnecessary attack surface.

If a tool needs direct database access from the workstation (e.g., pgAdmin, DBeaver), run it as a container on `homelab-net` rather than opening the port to the LAN.
