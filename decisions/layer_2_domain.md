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
| dynDNS | — | 🔍 Not yet started |
| Reverse proxy | — | 🔍 Not yet started |
| Sablier (on-demand containers) | — | 🔍 Not yet started |

## Open Decisions

1. Reverse proxy: Caddy vs Traefik vs SWAG (nginx)
   - Caddy: simplest config, automatic TLS, good Sablier support
   - Traefik: label-driven, more dynamic but more complex
2. dynDNS provider: Cloudflare (free, API-driven) vs others
3. Sablier: confirm compatibility with chosen reverse proxy
4. No-LAN-leakage implementation: firewall rules vs proxy-only port exposure

## Out of Scope at Layer 2

| Capability | Belongs to | Notes |
|------------|-----------|-------|
| Self-hosted services | Layer 3 | Services are user-chosen and added independently |
