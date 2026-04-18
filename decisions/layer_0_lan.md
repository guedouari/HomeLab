# Layer 0 — LAN

This file is the index for Layer 0 (LAN) decisions.
Each capability is discussed in its own folder inside `decisions/layer_0_lan/`.

## Scope

Layer 0 is the isolated LAN baseline:

- Services are accessible only within the local network
- Security is light — the LAN is trusted
- No internet exposure, no VPN, no reverse proxy
- Goal: lightest possible footprint; only services with a clear LAN use case

Docker Engine + Docker Compose must already be installed on the server (see [prerequisites](layer_0_lan/prerequisites.md)).

## Capabilities

| Capability | Discussion | Status |
|------------|------------|--------|
| Prerequisites | [layer_0_lan/prerequisites.md](layer_0_lan/prerequisites.md) | Assumptions defined |
| File sharing | [layer_0_lan/file-sharing/](layer_0_lan/file-sharing/README.md) | ✅ Verified (`ghcr.io/servercontainers/samba`) |
| DNS filtering | [layer_0_lan/dns/](layer_0_lan/dns/README.md) | ✅ Verified (`adguard/adguardhome`) |
| Monitoring | [layer_0_lan/monitoring/](layer_0_lan/monitoring/README.md) | ✅ Verified (`twinproduction/gatus`) |

## Out of Scope at Layer 0

| Capability | Belongs to | Notes |
|------------|-----------|-------|
| Database (PostgreSQL) | Layer 3 | No Layer 0 service needs a DB; introduce when a specific service requires it |
| VPN | Layer 1 | WAN access comes at Layer 1 |
| Reverse proxy / TLS | Layer 2 | Domain name routing comes at Layer 2 |
| Self-hosted services | Layer 3 | Services (Nextcloud, etc.) are user-chosen and layered on top |

## Open Decisions

*(All Layer 0 capabilities verified. Remaining decisions are Layer 1+.)*
