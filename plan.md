# HomeLab - Plan

This plan keeps scope tight: define the foundation, keep choices simple, and build in layers.

## References

- Device baseline: [decisions/device-support-matrix.md](decisions/device-support-matrix.md)
- Platform choice (final): [decisions/platform-choice.md](decisions/platform-choice.md)
- Layer 0 details: [decisions/layer_0_lan.md](decisions/layer_0_lan.md)

## Finalized Decisions

- Container platform: Docker Engine + Docker Compose
- Orchestration model: single-node

## Preferred / Proposed (not yet finalized)

- Layer 1 reverse proxy: TBD — under evaluation
- On-demand startup: TBD — under evaluation

## Core Principles

- Same domain names on LAN and WAN.
- No tunneling by default.
- VPN is available when needed.
- LAN services stay LAN-only.
- On-demand startup for non-essential services.

## Layer Model

### Layer 0 - LAN (current focus)
Goal: make all required devices work on the local network reliably.

Capabilities needed:
- DNS filtering
- File sharing
- Monitoring

Outcome:
- Steam Deck, phones, and laptops can use the home stack on LAN.
- Desktop and smart TV are fully supported.

### Layer 1 - WAN Access
Goal: secure remote access path.

Capabilities needed:
- VPN
- Private domain
- Reverse proxy with TLS
- On-demand startup

Depends on: Layer 0

### Layer 2 - User Services
Goal: user-selected apps only.

Primary examples:
- File sync and productivity suite
- Password manager
- Media services (server + photo backup)

Rules:
- Users can install one service or many.
- Every Layer 2 service requires Layer 0 and Layer 1.

### Layer 3 - Extended Homelab
Goal: extra experimentation after core stack is stable.

Primary examples:
- Local LLM / AI assistant
- GPU-heavy workloads on high-end hardware

Rules:
- Requires Layers 0, 1, and 2.
- Strictly optional.

## Build Order

1. Finalize and ship Layer 0.
2. Add Layer 1 for WAN domain and routing.
3. Add chosen Layer 2 services.
4. Add Layer 3 experiments only when resources allow.

## Open Decisions (Layer 0 first)

1. DNS filtering service: under evaluation
2. File sharing service: under evaluation
3. Monitoring service: under evaluation
4. Database server: under evaluation
5. DNS networking mode on target host: bridge, macvlan, or host networking — decided at implementation

## Current Scope Guardrails

- Do not expand into broad service catalogs during Layer 0 work.
- Keep service-specific compatibility in each service discussion.
- Keep this file high-level; implementation detail belongs in decision files.


