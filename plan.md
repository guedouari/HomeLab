# HomeLab - Plan

This plan keeps scope tight: define the foundation, keep choices simple, and build in layers.

## References

- Device baseline: [decisions/device-support-matrix.md](decisions/device-support-matrix.md)
- Platform choice (final): [decisions/platform-choice.md](decisions/platform-choice.md)
- Layer 0 details: [decisions/layer_0.md](decisions/layer_0.md)

## Finalized Platform Decisions

- Container platform: Docker Engine + Docker Compose
- Orchestration model: single-node
- Layer 1 reverse proxy: SWAG (preferred to align with linuxserver images)
- On-demand startup: Sablier for selected Layer 2+ services

## Core Principles

- Same domain names on LAN and WAN.
- No tunneling by default.
- VPN is available when needed.
- LAN services stay LAN-only.
- On-demand startup for non-essential services.

## Layer Model

### Layer 0 - Core (current focus)
Goal: make all required devices work on LAN, with VPN available for remote access when needed.

Primary choices:
- DNS: Pi-hole
- File sharing: Samba on generic hosts, native NAS shares on NAS systems
- VPN: WireGuard
- Monitoring: Uptime Kuma

Outcome:
- Steam Deck, phones, and laptops can use the home stack reliably.
- Desktop and smart TV are fully supported on LAN.

### Layer 1 - WAN Access
Goal: secure remote access path.

Primary choices:
- Private domain
- SWAG as reverse proxy (preferred; linuxserver ecosystem)
- Sablier for on-demand startup
- TLS via DNS challenge (SWAG + Certbot)

Depends on: Layer 0

### Layer 2 - User Services
Goal: user-selected apps only.

Primary examples:
- Nextcloud
- Vaultwarden
- Media services (Jellyfin, Immich)

Rules:
- Users can install one service or many.
- Every Layer 2 service requires Layer 0 and Layer 1.

### Layer 3 - Extended Homelab
Goal: extra experimentation after core stack is stable.

Primary examples:
- Personal/local LLM
- GPU-heavy services on Steam machine

Rules:
- Requires Layers 0, 1, and 2.
- Strictly optional.

## Build Order

1. Finalize and ship Layer 0.
2. Add Layer 1 for WAN domain and routing.
3. Add chosen Layer 2 services.
4. Add Layer 3 experiments only when resources allow.

## Open Decisions (Layer 0 first)

1. WireGuard image default: wg-easy or linuxserver/wireguard
2. Monitoring exposure: LAN-only, VPN-only, or HTTPS behind auth
3. DNS mode on target host: bridge, macvlan, or host networking
4. File-sharing profile defaults by hardware target

## Current Scope Guardrails

- Do not expand into broad service catalogs during Layer 0 work.
- Keep service-specific compatibility in each service discussion.
- Keep this file high-level; implementation detail belongs in decision files.


