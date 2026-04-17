# Layer 0 — LAN

This file is the index for Layer 0 (LAN) decisions.
Each capability is discussed in its own file inside `decisions/layer_0_lan/`.

## Scope

Layer 0 covers the LAN-only baseline defined in [device-support-matrix.md](device-support-matrix.md):

- LAN support for all listed devices
- No WAN, VPN, or remote access — those belong to Layer 1
- Docker Engine + Docker Compose must already be installed on the server (see [prerequisites](layer_0_lan/prerequisites.md))

## Capabilities

| Capability | Discussion | Image | Status |
|------------|------------|-------|--------|
| Prerequisites | [layer_0_lan/prerequisites.md](layer_0_lan/prerequisites.md) | — | Assumptions defined |
| DNS filtering | [layer_0_lan/dns.md](layer_0_lan/dns.md) | `adguard/adguardhome` | ✅ AdGuard Home |
| File sharing | [layer_0_lan/file-sharing.md](layer_0_lan/file-sharing.md) | `ghcr.io/servercontainers/samba` | ✅ Samba |
| Monitoring | [layer_0_lan/monitoring.md](layer_0_lan/monitoring.md) | `louislam/uptime-kuma:2` | ✅ Uptime Kuma (provisional) |
| Database server | [layer_0_lan/database.md](layer_0_lan/database.md) | `pgvector/pgvector:pg17` | ✅ PostgreSQL |

## Open Decisions

1. DNS networking mode on target host: bridge, macvlan, or host networking (see [dns.md](layer_0_lan/dns.md))
2. Notification channel for Uptime Kuma: ntfy vs Telegram (see [monitoring.md](layer_0_lan/monitoring.md))
3. Monitoring tool revisit at Layer 1: Checkmk vs Uptime Kuma (see [monitoring.md](layer_0_lan/monitoring.md))
