# HomeLab - Layer 0 Decision Draft

This file tracks only Layer 0 (core) decisions.

## Scope

Layer 0 must support the baseline devices defined in [decisions/device-support-matrix.md](decisions/device-support-matrix.md):

- LAN support for all listed devices
- VPN path for remote-capable devices when needed
- No service-specific deep dives here

## Layer 0 Capabilities

### DNS
Primary: Pi-hole
Alternatives: AdGuard Home, Technitium DNS Server

### File Sharing
Primary: Samba on generic hosts
NAS profile: native NAS shares by default
Alternatives: NFS (Linux-first homes)

### VPN
Primary: WireGuard
Alternatives: Tailscale, Headscale, OpenVPN

### Monitoring
Primary: Uptime Kuma
Alternatives: Gatus, Healthchecks

## Minimal Decision Matrix

| Capability | Primary choice | Always on | LAN only | Notes |
|------------|----------------|-----------|----------|-------|
| DNS | Pi-hole | Yes | Yes | Foundation for local naming |
| File sharing | Samba or native NAS shares | Yes | Yes | NAS uses native shares by default |
| VPN | WireGuard | Yes | No | Remote access path when needed |
| Monitoring | Uptime Kuma | Yes | Preferred | Exposure model still open |

## Decisions Still Open

1. WireGuard default image: wg-easy or linuxserver/wireguard
2. Monitoring exposure model
3. DNS networking mode on first target host
4. Exact profile defaults by hardware target

