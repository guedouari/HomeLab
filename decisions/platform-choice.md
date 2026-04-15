# HomeLab - Platform Choice (Final)

This file records finalized platform decisions for the current scope.

## Final Decisions

| Area | Decision |
|------|----------|
| Container platform | Docker Engine + Docker Compose |
| Image source | linuxserver.io (preferred for all services where available) |
| Orchestration model | Single-node |

## Preferred / Proposed (not yet finalized)

| Area | Candidate | Notes |
|------|-----------|-------|
| Reverse proxy (Layer 1) | SWAG (linuxserver/swag) | Preferred; aligns with linuxserver ecosystem |
| On-demand startup | Sablier | Preferred; starts services on request, stops after idle |

## Why these choices

- Docker Compose is the simplest and most portable option across mini PC, Raspberry Pi, and NAS-style environments.
- Single-node keeps operations manageable for home use.
- linuxserver.io images provide consistent, well-maintained containers across ARM64 and x86_64.
- SWAG is the preferred reverse proxy to align with linuxserver images and established community patterns.
- Sablier preserves host resources by starting non-essential services only when requested.

## Notes

- LAN-only services remain LAN-only regardless of proxy choice.
- Service-specific compatibility stays in each service/layer decision file.
- A decision moves from "preferred/proposed" to "final" only when documented as such in its own decision file.

