# DNS Filtering — Image Candidates

## Evaluation

Three tools considered: Pi-hole, AdGuard Home, Technitium.

**Technitium** — eliminated immediately. Significantly more complex to configure and operate without meaningful benefit for home-lab DNS filtering.

### Pi-hole vs AdGuard Home

| Feature | Pi-hole | AdGuard Home |
|---------|---------|--------------|
| Image | `pihole/pihole` (Docker Hub) | `adguard/adguardhome` (Docker Hub) |
| linuxserver image | ❌ none | ❌ none |
| Pulled & verified | — | ✅ |
| Local DNS rewrites | ✅ | ✅ cleaner UI |
| Ad/tracker blocking | ✅ mature | ✅ good |
| Upstream DoH / DoT | ❌ needs cloudflared sidecar | ✅ built-in |
| Per-client settings | Via groups (extra steps) | Per-client directly |
| ARM64 | ✅ | ✅ |
| Active development | Mature / stable | Very active |

**Key differentiator:** AdGuard Home handles encrypted upstream DNS (DoH/DoT) natively — no sidecar container needed. Pi-hole requires a separate `cloudflared` container for the same result.

**Key differentiator:** AdGuard Home per-client rules are applied directly in the UI. Pi-hole uses "groups" which requires more steps.

## Decision: AdGuard Home

`adguard/adguardhome` — selected.

| Item | Value |
|------|-------|
| Image | `adguard/adguardhome:latest` |
| Registry | Docker Hub |
| Digest | `sha256:f29c58a91f79387cbbbb042e140814f58e830d457d44af03d662c8df43db9dea` |
| Pulled & verified | ✅ |
| Multi-arch (amd64 + arm64) | ✅ |
| Maintained | ✅ actively developed |

> **Rule:** Do not change the image without re-pulling and re-running `testing.md`.
