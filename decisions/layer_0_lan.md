# Layer 0 — LAN

This file is the index for Layer 0 (LAN) decisions.
Each capability is discussed in its own file inside `decisions/layer_0_lan/`.

## Scope

Layer 0 covers the LAN-only baseline defined in [device-support-matrix.md](device-support-matrix.md):

- LAN support for all listed devices
- No WAN, VPN, or remote access — those belong to Layer 1
- Docker Engine + Docker Compose must already be installed on the server (see [prerequisites](layer_0_lan/prerequisites.md))

## Capabilities

| Capability | Discussion | Status |
|------------|------------|--------|
| Prerequisites | [layer_0_lan/prerequisites.md](layer_0_lan/prerequisites.md) | Assumptions defined |
| DNS filtering | [layer_0_lan/dns.md](layer_0_lan/dns.md) | 🔍 Under evaluation |
| File sharing | [layer_0_lan/file-sharing/](layer_0_lan/file-sharing/README.md) | ✅ Verified (`ghcr.io/servercontainers/samba`) |
| Monitoring | [layer_0_lan/monitoring.md](layer_0_lan/monitoring.md) | 🔍 Under evaluation |
| Database server | [layer_0_lan/database.md](layer_0_lan/database.md) | 🔍 Under evaluation |

## Open Decisions

1. DNS filtering service: tool selection and networking mode (see [dns.md](layer_0_lan/dns.md))
2. Monitoring service: tool selection and notification channel (see [monitoring.md](layer_0_lan/monitoring.md))
3. Database server: tool selection and image verification (see [database.md](layer_0_lan/database.md))
