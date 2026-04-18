# VPN (WireGuard)

## Role

WireGuard is the single internet-facing entry point at Layer 1. It provides secure remote access to all Layer 0 services without exposing any of them directly to the internet.

VPN peers join the home subnet — they can reach Samba shares, AdGuard Home, Gatus, and any other Layer 0 service exactly as if they were physically on-site.

## Chosen image

**`linuxserver/wireguard:latest`**

- Multi-arch: `amd64`, `arm64` ✅
- Compressed size: ~113 MB
- File-based config: `/config/wg_confs/wg0.conf` (auto-generated from env vars on first run, then user-editable)
- Peer QR codes generated automatically for mobile clients
- No web UI — all config is in `wg0.conf` and peer conf files

See [candidates.md](candidates.md) for the evaluation.

## Quick reference

| Property | Value |
|----------|-------|
| Image | `linuxserver/wireguard:latest` |
| Protocol | UDP |
| Default port | `51820/udp` |
| VPN subnet | `10.13.13.0/24` |
| Server address in VPN | `10.13.13.1` |
| Config path in container | `/config/wg_confs/wg0.conf` |
| Peer configs | `/config/peer_<name>/` |

## How peers work

On first start, `linuxserver/wireguard` auto-generates:
- Server private/public key pair
- One set of config files per `PEERS` entry (peer conf + QR code PNG)

Peer configs are in `/config/peer_<name>/peer_<name>.conf` — copy to client or scan the QR code.

After initial generation the config files are stable — adding peers requires adding the name to `PEERS` and restarting.

## See also

- [configuration.md](configuration.md) — environment variables and wg0.conf breakdown
- [testing.md](testing.md) — test results
- [horizon.md](horizon.md) — advanced use cases (site-to-site, road warrior, split tunnelling)
