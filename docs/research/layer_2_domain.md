# Layer 2 — Domain

This file is the index for Layer 2 decisions.

## Scope

Layer 2 makes services reachable from the internet via a public domain name:

- **dynDNS** — keeps the public domain pointing at the home IP even when it changes
- **Reverse proxy** — TLS termination and HTTP routing; the single entry point from the internet
- **Sablier** — on-demand container startup; idle services are stopped, started on first request (critical for gaming workloads on Steam Machine)
- **Hardened security** — direct IP:port access to services is locked; everything routes through the proxy. No LAN leakage: a service at `service.homelab.example.com` is not reachable at `192.168.1.10:PORT` from outside Layer 2

Layer 2 is a strict superset of Layers 0 and 1.

## Capabilities

| Capability | Discussion | Status |
|------------|------------|--------|
| dynDNS | [ddns/](layer_2_domain/ddns/README.md) | ✅ Done |
| Reverse proxy | [reverse-proxy/](layer_2_domain/reverse-proxy/README.md) | ✅ Done |
| Sablier (on-demand containers) | [sablier/](layer_2_domain/sablier/README.md) | ✅ Done |

## Open Decisions

1. ~~Reverse proxy~~ — resolved: Caddy (custom build with cloudflare DNS + sablier plugins)
2. ~~dynDNS provider~~ — resolved: `timothyjmiller/cloudflare-ddns` (1.2 MB, Cloudflare-only)
3. ~~Sablier compatibility~~ — resolved: Caddy sablier plugin confirmed loaded
4. No-LAN-leakage: implemented via router firewall rules (only TCP 80, 443, UDP 51820 open to internet)

## Out of Scope at Layer 2

| Capability | Belongs to | Notes |
|------------|-----------|-------|
| Self-hosted services | Layer 3 | Services are user-chosen and added independently |
