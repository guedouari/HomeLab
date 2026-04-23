---
id: decision-4
title: Layer structure — four additive capability layers
date: '2026-04-23 12:15'
status: Accepted
---

## Context

A homelab stack can vary widely in scope — from a single LAN-only DNS filter to a full self-hosted cloud with public domain, VPN, and multiple services. A monolithic config that includes everything at once is hard to deploy, hard to debug, and imposes unnecessary complexity on users who only want a subset of capabilities.

The generator must be able to produce configs that match the user's actual needs, not a fixed all-or-nothing stack.

## Decision

The stack is organised as **four additive layers**. Each layer is a strict superset of all previous layers. A user deploys the highest layer they need; all lower-layer capabilities are included automatically.

| Layer | Name | Primary capability added |
|-------|------|--------------------------|
| **0** | LAN | DNS filtering, local file sharing, lightweight monitoring — LAN-only, no internet exposure |
| **1** | WAN | WireGuard VPN + CrowdSec firewall + split-horizon DNS — secure remote access |
| **2** | Domain | dynDNS + Caddy reverse proxy + TLS + Sablier on-demand startup — public domain name |
| **3** | Services | User-selected self-hosted services on top of Layers 0–2 infrastructure — Nextcloud is the primary example; multiple independent services can be deployed per user choice |

### Layer boundaries and rules

**Layer 0 — LAN**
- Services are LAN-only; no internet exposure of any kind
- Security model: the LAN is trusted; no hardening beyond service-level defaults
- No database, no VPN, no reverse proxy — those belong to higher layers
- Goal: smallest possible footprint with a clear LAN use case for each service

**Layer 1 — WAN**
- WireGuard is the only service exposed to the internet
- VPN peers join the home LAN — all Layer 0 services are reachable as if on-site
- Split-horizon DNS: AdGuard Home resolves domain names to the internal IP for LAN and VPN clients
- CrowdSec monitors system logs; iptables restricts ingress
- Layer 0 services are unchanged

**Layer 2 — Domain**
- A public domain name + dynDNS keeps services reachable when the home IP changes
- Caddy is the single TLS entry point; direct IP:port access from outside is locked down
- Sablier stops idle services and starts them on the first request (critical for gaming workloads: a Steam Machine running games cannot afford container overhead)
- Split-horizon DNS continues: same domain resolves to internal IP on LAN/VPN, public IP on WAN
- Layers 0 and 1 are unchanged

**Layer 3 — Services**
- **User-selected** self-hosted services — the user chooses which services to deploy; there is no fixed service set
- Multiple services can be active simultaneously; each is deployed independently and does not affect others
- Nextcloud is the primary reference service (files, contacts, calendar, Memories) but is not mandatory
- Other services follow the same evaluation rule: real use case + verified image + passing tests before inclusion
- No service is added speculatively — candidates that haven't been evaluated go in `horizon.md`
- Services that need a database introduce a shared PostgreSQL instance (one DB + user per service)
- Layer 3 is the generator's highest output layer

### Superset invariant

Any config valid at layer N is also valid at layer N+1. The generator for layer N+1 calls the layer N generator and extends its output. A user can start at Layer 0 and progressively deploy higher layers without rewriting anything.

## Consequences

- The generator is structured as four composable modules, one per layer, each extending the previous
- Golden-file tests validate each layer independently and cumulatively
- Documentation and deployment guides are written per-layer; users only read what applies to them
- Service-specific decisions reference their layer explicitly

## Alternatives

**Flat single-layer config:** All services in one Compose file, feature-flagged via env vars. Simpler to reason about for a single deployment but does not compose and produces a very large file for partial stacks. Ruled out.

**Capability-based grouping (not layered):** Group by function (networking, storage, security) rather than deployment progression. Does not map to a natural deployment order and makes the "what do I deploy first?" question harder. Ruled out.
