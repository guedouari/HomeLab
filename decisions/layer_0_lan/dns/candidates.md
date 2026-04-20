# DNS Filtering — Image Candidates

## Evaluation

Three tools considered: Pi-hole, AdGuard Home, Technitium.

**Technitium** — eliminated immediately. Significantly more complex to configure and operate without meaningful benefit for a homelab DNS filter.

---

### Pi-hole vs AdGuard Home

Evaluated against **project principles** (in order of priority):
1. Lighter is better — fewer containers, smaller images
2. File config over wizard/UI config — reproducible, no browser required
3. Features needed without extra sidecars

| | **Pi-hole** | **AdGuard Home** |
|---|---|---|
| **Image** | `pihole/pihole` (Docker Hub) | `adguard/adguardhome` (Docker Hub) |
| **Pulled & verified** | — | ✅ |
| **ARM64** | ✅ | ✅ |
| **Config method** | Env vars + `/etc/pihole/` files | Pre-baked `AdGuardHome.yaml` — wizard skipped ✅ |
| **First-run friction** | Low — env vars handle setup | None — pre-supply config file, starts immediately |
| **DNS rewrites** | `/etc/pihole/custom.list` (plain file) ✅ | YAML in `AdGuardHome.yaml` ✅ |
| **Blocklists** | Gravity DB (requires `pihole -g` to update) | YAML config, updates automatically |
| **Upstream DoH/DoT** | ❌ requires cloudflared sidecar | ✅ built-in |
| **Extra containers needed** | +1 (cloudflared) for encrypted upstream | 0 — single container |
| **Ad/tracker blocking** | ✅ very mature, large community | ✅ good, growing ecosystem |
| **Per-client rules** | Via groups (extra steps) | Per-client directly |
| **Active development** | Mature / stable | Very active |

### Key differentiators

**Upstream encryption (DoH/DoT):**
Pi-hole queries upstream DNS in plaintext by default. To encrypt upstream queries requires adding a `cloudflared` sidecar container. AdGuard Home handles this natively — select any DoH/DoT endpoint in the config. Under the "fewer containers" principle, this is a clear win for AdGuard Home.

**File config:**
Both support file-based configuration. Pi-hole uses env vars + `/etc/pihole/` directory (mature, well-documented). AdGuard Home's wizard is bypassed by pre-supplying `AdGuardHome.yaml` — the container detects the file on first start and skips the wizard entirely. Both are reproducible from a file; neither requires browser interaction once the config is prepared.

**Pi-hole does not gain an advantage on the file-config criterion** — it avoids a wizard, but so does AdGuard Home with the pre-baked config approach. The sidecar requirement for encrypted upstream is the deciding factor.

---

## Decision: AdGuard Home ✅

`adguard/adguardhome` — selected.

| Item | Value |
|------|-------|
| Image | `adguard/adguardhome:latest` |
| Registry | Docker Hub |
| Digest | `sha256:f29c58a91f79387cbbbb042e140814f58e830d457d44af03d662c8df43db9dea` |
| Pulled & verified | ✅ |
| Multi-arch (amd64 + arm64) | ✅ |
| Extra containers needed | 0 |
| Setup friction | None — pre-baked `AdGuardHome.yaml` skips wizard |

> **Rule:** Do not change the image without re-pulling and re-running `testing.md`.
