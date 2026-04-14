# HomeLab - Platform Choice (Final)

This file records finalized platform decisions for the current scope.

## Final Decisions

| Area | Decision |
|------|----------|
| Container platform | Docker Engine + Docker Compose |
| Orchestration model | Single-node only |
| Reverse proxy (Layer 1) | SWAG (linuxserver/swag) preferred |
| On-demand startup | Sablier for selected Layer 2+ services |

## Why these choices

- Docker Compose is the simplest and most portable option across mini PC, Raspberry Pi, and NAS-style environments.
- Single-node keeps operations manageable for home use.
- SWAG is preferred to align with linuxserver images and established community patterns.
- Sablier preserves host resources by starting non-essential services only when requested.

## Notes

- LAN-only services remain LAN-only regardless of proxy choice.
- Service-specific compatibility stays in each service/layer decision file.
- Re-evaluate only if project scope changes significantly.

