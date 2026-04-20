# VPN — Candidate Evaluation

## Criteria (in priority order)

1. Lighter is better — smallest image, fewest containers
2. File config over wizard/UI — reproducible, version-controlled setup
3. ARM64 required
4. FOSS

## Candidates

| Image | Size | ARM64 | Config style | Notes |
|-------|------|-------|--------------|-------|
| `linuxserver/wireguard` | 113 MB | ✅ | File (`wg0.conf`) | Auto-generates keys + peer configs; no UI |
| `wg-easy/wg-easy` | ~200 MB | ✅ | Web UI + file | Web dashboard for peer management — violates file-config principle |
| `weejewel/wg-easy` | ~200 MB | ✅ | Web UI | Same project as above, older tag |
| `ngoduykhanh/wireguard-ui` | ~300 MB | ✅ | Web UI | UI-first, stores config in DB |
| Plain `wireguard-go` | ~20 MB | ✅ | File only | No orchestration helpers; manual everything |

## Decision: `linuxserver/wireguard`

**Why not `wg-easy`:** Web UI for peer management violates the "file config over wizard" principle. Config lives in a database behind a UI, making it harder to version-control and reproduce.

**Why not plain `wireguard-go`:** Requires manual key generation, manual wg0.conf assembly, and manual peer distribution. `linuxserver/wireguard` wraps this with automatic key generation and QR codes while keeping the final config as a standard `wg0.conf` file. The overhead is worth it.

**Why `linuxserver/wireguard`:**
- Output is a plain `wg0.conf` — editable, version-controllable
- Peer configs auto-generated (QR codes for mobile) but stored as files
- Single container, no sidecar needed
- ARM64 ✅, actively maintained
