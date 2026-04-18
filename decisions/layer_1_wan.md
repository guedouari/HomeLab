# Layer 1 — WAN (VPN)

This file is the index for Layer 1 decisions.

## Scope

Layer 1 adds secure remote access to the home LAN:

- WireGuard VPN is the only service exposed to the internet
- VPN peers join the home LAN — all Layer 0 services are reachable as if on-site
- Split-horizon DNS: AdGuard Home (Layer 0) resolves domain names to internal IP for LAN and VPN clients
- Security hardened at the VPN endpoint

Layer 1 is a strict superset of Layer 0. All Layer 0 services remain unchanged.

## Capabilities

| Capability | Discussion | Status |
|------------|------------|--------|
| VPN (WireGuard) | [vpn/](layer_1_wan/vpn/README.md) | ✅ Done |

## Open Decisions

1. ~~WireGuard image~~ — resolved: `linuxserver/wireguard` (file config, ARM64, no web UI)
2. ~~Key management~~ — resolved: auto-generated on first start, stored as files in `data/wireguard/`
3. ~~Split-horizon DNS~~ — resolved: set `PEERDNS` to server LAN IP; AdGuard Home serves VPN peers with no extra config
4. Firewall rules: restrict VPN peer access to specific services or full LAN? — deferred; default is full LAN access (appropriate for trusted household devices)

## Out of Scope at Layer 1

| Capability | Belongs to | Notes |
|------------|-----------|-------|
| Public domain / HTTPS | Layer 2 | Domain and TLS come at Layer 2 |
| Reverse proxy | Layer 2 | — |
| Self-hosted services | Layer 3 | — |
