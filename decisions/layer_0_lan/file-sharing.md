# Layer 0 LAN — File Sharing

## Role

Provide LAN-accessible file shares so all devices (Windows, Linux, macOS, Android, iOS) can read and write files on the server as if it were a NAS.

---

## Protocol Landscape

| Protocol | Full name | Native client support |
|----------|-----------|----------------------|
| **SMB/CIFS** (Samba) | Server Message Block | Windows ✅ · macOS ✅ · Linux ✅ · Android ✅ · iOS ✅ |
| **NFS** | Network File System | Linux ✅ · macOS ✅ · Windows ⚠️ (requires extra install) · Android ❌ · iOS ❌ |

NFS is eliminated immediately — the device matrix in [device-support-matrix.md](../device-support-matrix.md) includes Windows, Android, and iOS, none of which support NFS natively. Samba (SMB) is the only protocol that covers all targets without per-device configuration.

---

## Candidates

### Samba (Docker container)

Samba implements the SMB/CIFS protocol. No linuxserver image exists for Samba. Verified candidate images:

> **Image verification** — before finalising any service choice, confirm the Docker image exists and document the exact registry path. Pull the image or check the source registry directly; do not rely on documentation that has not been tested.

| Image | Registry | Maintained | Notes |
|-------|----------|:----------:|-------|
| `servercontainers/samba` | `ghcr.io/servercontainers/samba` | ✅ | Actively updated; env-var config; supports wsdd2, Time Machine |
| `crazymax/samba` | Docker Hub | ✅ | Multi-arch; YAML-based config |
| `dperson/samba` | Docker Hub | ❌ | Unmaintained (4+ years); excluded |

**Chosen image: `ghcr.io/servercontainers/samba`** — actively maintained, env-var driven (fits Compose), modern SMB support.

**Pros:**
- Universal client support across all devices in the matrix
- Works on all three hardware targets (Steam Machine, NAS, Raspberry Pi)
- Well understood protocol; large community and documentation
- Coexists with native NAS shares on the same machine without conflict (different share names, same protocol)

**Cons:**
- Adds a container to the stack even on NAS hardware that already has native sharing
- SMB discovery (NetBIOS/mDNS) can require host networking or extra config in Docker

### Native NAS shares

On Synology or TrueNAS, the OS itself provides SMB shares via its own Samba implementation — no container needed.

**Pros:**
- Zero overhead; already part of the NAS OS
- Managed through the NAS admin UI

**Cons:**
- Not portable — only applies to NAS hardware targets
- Inconsistent with the rest of the stack (everything else is Docker)
- Having both native shares and a Samba container on the same NAS could cause confusion (duplicate shares, port conflicts)

---

## Cross-Target Analysis

The core question is whether to standardize on Samba across all targets or allow NAS hardware to use native sharing.

**Argument for standardizing on Samba everywhere:**
- Consistent deployment model — same Docker Compose file, same configuration approach across all hardware
- NAS hardware can run the Samba container alongside (or instead of) native shares without conflict since they use separate share paths
- Simplifies documentation and future automation (the config generator only needs one path)
- Native NAS sharing can still be left active for admin convenience; the Samba container just adds managed shares on top

**Argument for native NAS shares on NAS hardware:**
- Less overhead — one fewer container
- NAS admin UI is already familiar to NAS users

**Assessment:** The overhead of one Samba container is negligible. Standardizing on Samba across all targets is the cleaner choice for a consistent, automatable stack. On NAS hardware, native shares can remain active in parallel if desired — there is no conflict.

---

## Docker Networking

SMB uses ports 139 and 445. Unlike DNS (port 53), these ports are not typically occupied by the host OS, so bridge networking with port mapping works without conflicts.

However, **SMB network discovery** (browsing the network neighbourhood in Windows/macOS) relies on NetBIOS (port 137/138 UDP) and mDNS, which do not work well through Docker NAT. This only affects discoverability — direct access by hostname or IP always works regardless of networking mode.

| Mode | Port mapping | Discovery | Recommendation |
|------|:-----------:|:---------:|----------------|
| Bridge + port mapping | ✅ | ❌ (NetBIOS/mDNS broken) | Fine if accessing by IP or hostname |
| Host networking | ✅ | ✅ | Best discoverability |
| macvlan | ✅ | ✅ | Works but adds complexity |

**Recommended starting point:** bridge networking with port mapping. Discovery is a convenience feature — accessing shares by `\\server-ip\sharename` always works and is the documented approach.

---

## Share Layout

To be decided at implementation time, but the likely default:

| Share | Path | Access |
|-------|------|--------|
| `media` | `/data/media` | Read/write, all users |
| `files` | `/data/files` | Read/write, authenticated |
| `backup` | `/data/backup` | Write-only or restricted |

---

## Constraints

- Must be accessible from all device types in [device-support-matrix.md](../device-support-matrix.md)
- Must not be exposed outside the LAN
- Docker image must be verified and actively maintained

---

## Open Decisions

1. **Authentication model**: guest/anonymous vs user accounts (per-user credentials)
2. **Share layout**: paths and access permissions — decided at implementation
3. **NAS coexistence**: whether to disable native NAS shares when running the Samba container (to avoid duplication)

## Status

**Decided: Samba (`ghcr.io/servercontainers/samba`) across all hardware targets**

No linuxserver image exists for Samba. `servercontainers/samba` is the actively maintained choice — env-var config, modern SMB support, multi-arch. Standardizing on a single Samba container keeps the stack consistent and automatable. Native NAS shares may remain active in parallel but are not the managed path.

Docker networking and share layout remain open until implementation.
