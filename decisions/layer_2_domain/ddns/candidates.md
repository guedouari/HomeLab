# dynDNS — Candidate Evaluation

## Criteria

1. Lighter is better
2. File config over wizard/UI
3. ARM64 required
4. Cloudflare support (our DNS provider)

## Candidates

| Image | Size | ARM64 | Config | Notes |
|-------|------|-------|--------|-------|
| `timothyjmiller/cloudflare-ddns` | **1.2 MB** | ✅ | `cloudflare.json` | Purpose-built for Cloudflare, Go binary |
| `oznu/cloudflare-ddns` | ~15 MB | ✅ | Env vars only | Simpler but less control |
| `ddclient` | ~50 MB | ✅ | `ddclient.conf` | Multi-provider but heavy, complex config |
| `linuxserver/ddclient` | ~120 MB | ✅ | `ddclient.conf` | ddclient wrapped by linuxserver |
| Cloudflare Tunnel (`cloudflared`) | ~50 MB | ✅ | JSON | Different product — tunnels not DNS updates |

## Decision: `timothyjmiller/cloudflare-ddns`

At 1.2 MB this is one of the smallest Docker images we use. It does exactly one thing: check the current public IP and update a Cloudflare DNS A record if it has changed. Config is a JSON file — version-controllable, no env-var sprawl.

**Why not `oznu/cloudflare-ddns`:** Config is environment variables only (API key, zone, subdomain as separate env vars). Fine for simple cases but less flexible — can't update multiple subdomains with different settings. Also 12× larger.

**Why not `ddclient`:** Supports 60+ providers but 50+ MB for a Cloudflare-only homelab is wasteful. Config syntax is arcane.

**Update interval:** `timothyjmiller/cloudflare-ddns` checks every 5 minutes by default (configurable). Suitable for a residential connection where IP changes at most daily.
