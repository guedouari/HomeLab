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
| VPN (WireGuard) | — | 🔍 Not yet started |

## Open Decisions

1. WireGuard image: `linuxserver/wireguard` vs `wg-easy/wg-easy` (web UI) vs plain `wireguard-go`
2. Key management: manual config vs web UI vs QR codes for mobile devices
3. Split-horizon DNS: confirm AdGuard Home rewrite serves VPN subnet without extra config
4. Firewall rules: restrict VPN peer access to specific services or full LAN?

## Out of Scope at Layer 1

| Capability | Belongs to | Notes |
|------------|-----------|-------|
| Public domain / HTTPS | Layer 2 | Domain and TLS come at Layer 2 |
| Reverse proxy | Layer 2 | — |
| Self-hosted services | Layer 3 | — |
