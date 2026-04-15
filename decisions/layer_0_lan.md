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
| DNS filtering | [layer_0_lan/dns.md](layer_0_lan/dns.md) | ✅ AdGuard Home |
| File sharing | [layer_0_lan/file-sharing.md](layer_0_lan/file-sharing.md) | ✅ Samba |
| Monitoring | [layer_0_lan/monitoring.md](layer_0_lan/monitoring.md) | ✅ Uptime Kuma |
| Database server | [layer_0_lan/database.md](layer_0_lan/database.md) | ✅ PostgreSQL |

## Open Decisions

1. DNS networking mode on target host: bridge, macvlan, or host networking (see [dns.md](layer_0_lan/dns.md))
2. Notification channel for Uptime Kuma: ntfy vs Telegram (see [monitoring.md](layer_0_lan/monitoring.md))
3. pgvector availability in linuxserver/postgresql image (see [database.md](layer_0_lan/database.md))
