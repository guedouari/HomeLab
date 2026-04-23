---
id: decision-5
title: Device support matrix
date: '2026-04-23 12:15'
status: Accepted
---

## Context

The homelab stack serves a heterogeneous set of client devices across different operating systems, form factors, and network access patterns. Without an explicit baseline, individual service decisions have no shared reference for what "works" means — leading to inconsistent compatibility claims and gaps in deployment guides.

An explicit device matrix establishes the non-negotiable compatibility floor for the architecture as a whole.

## Decision

The matrix is split into two categories: **server targets** (hardware the stack runs on) and **connected devices** (clients that consume the services).

### Server targets

These are the machines that run Docker + the homelab stack. All images must support every architecture listed here.

| Server | Architecture | Notes |
|--------|-------------|-------|
| Steam Machine / x86_64 PC | x86_64 | Primary development and gaming target; Sablier at Layer 2 is critical — gaming must not be impacted by container overhead |
| Raspberry Pi 4 / 5 | ARM64 | Low-power always-on target; ARM64 image support is mandatory for every service |
| NAS (Synology / TrueNAS) | x86_64 or ARM64 | Docker-compatible; may coexist with native NAS shares |

**ARM64 is a hard requirement.** Any image that does not publish a `linux/arm64` manifest is disqualified.

### Connected devices

These are the client devices that access services running on the server. They drive UX and compatibility requirements for each service.

| Device | OS | Network access | Primary use case |
|--------|----|----------------|-----------------|
| Steam Deck | SteamOS (Linux) | LAN + WAN | Gaming + media; must not be bottlenecked by home-server latency while gaming |
| Desktop PC / Dual-boot | Windows or Linux | LAN only | Primary high-performance workstation; remote access not required |
| Windows Laptop | Windows | LAN + WAN | Productivity, file sharing, document editing |
| Linux Laptop | Linux | LAN + WAN | Development, testing, CLI access |
| Smart TV | Android / webOS | LAN only | Media playback, dashboard display |
| Android Phone | Android | LAN + WAN | Personal productivity, messaging, media consumption |
| iPhone | iOS | LAN + WAN | Personal productivity, messaging, media consumption |

### Connectivity by layer

| Layer | Access model | DNS behaviour |
|-------|-------------|---------------|
| **0 — LAN** | Internal IP or local DNS name (e.g. `homelab.lan`) | AdGuard Home resolves to server LAN IP |
| **1 — WAN** | WireGuard VPN; peers join the LAN and behave identically to Layer 0 | AdGuard Home serves VPN peers via `PEERDNS` — split-horizon applies |
| **2 — Domain** | Public domain name via Caddy reverse proxy + TLS | Split-horizon: internal IP on LAN/VPN, public IP on WAN — same hostname everywhere |
| **3 — Services** | Per-service; re-evaluated against this matrix per service | Inherits Layer 2 DNS |

### LAN-only connected devices

Desktop PC and Smart TV are LAN-only by design. Remote access for these is not a requirement and will not be tested.

### Connectivity principles

1. **No forced VPN** — devices must not be required to use a VPN to access a basic service. VPN mode is supported but optional.
2. **Same domain everywhere** — identical hostnames on LAN and WAN via split-horizon DNS; no per-device DNS config required.
3. **Gaming-friendly** — latency-sensitive workloads (Steam Deck, online multiplayer) must not be impacted by home-server overhead. Sablier on-demand startup at Layer 2 is specifically motivated by this constraint.
4. **Mixed OS support** — all services must assume heterogeneous client OSes; no OS-specific hacks unless explicitly documented.
5. **ARM64 required on server targets** — all images must support `linux/arm64` (Raspberry Pi target); this is a server-side constraint that applies to every service, independent of client device.

## Consequences

- Each service decision references this matrix and states which connected devices it supports and under what conditions
- Server-side image selection is constrained by the server target architectures (ARM64 mandatory)
- Services that are LAN-only by design (Samba, AdGuard admin UI) document that as an intentional scope boundary, not a limitation
- Deployment guides set expectations per device type based on this matrix
- Network configuration (DNS, firewall, reverse proxy) is validated against the connected device set

## Alternatives

**No explicit matrix (per-service only):** Each service tracks its own compatibility in isolation. Creates inconsistency — one service may claim broad support without a shared definition of what "LAN + WAN" means. Ruled out.

**Single flat device list (no server/client split):** Conflates deployment targets with client devices, making architecture decisions harder to reason about. Ruled out.

**Broader connected device list (game consoles, tablets, etc.):** Additional devices can be added deliberately as use cases are confirmed. The current list reflects real usage; speculative additions go in `horizon.md`.
