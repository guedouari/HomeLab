# File Sharing — Decision Index

## Role

Provide LAN-accessible file shares so all devices (Windows, Linux, macOS, Android, iOS) can read and write files on the server as if it were a NAS.

---

## Status

✅ **Verified** — `ghcr.io/servercontainers/samba` tested and passing. See [testing.md](testing.md) for full results.

**Selected image:** `ghcr.io/servercontainers/samba` (digest `sha256:155d384c4e3948f84ab8126647877bb409d7882a04173952bddf78fa547e1f9b`, smbd 4.22.8)

---

## Sections

| File | Contents |
|------|----------|
| [protocol.md](protocol.md) | Protocol landscape, elimination of candidates (SMB vs NFS, etc.) |
| [candidates.md](candidates.md) | Docker image candidates, verification status, comparison |
| [networking.md](networking.md) | Docker networking modes, discovery behaviour |
| [configuration.md](configuration.md) | Share layout, authentication model, environment variables |
| [testing.md](testing.md) | Verification checklist and results — **gate for finalising status** |
| [horizon.md](horizon.md) | Out-of-scope ideas and future capabilities with Samba analysis |

---

## Constraints

- Must be accessible from all device types in [device-support-matrix.md](../../device-support-matrix.md)
- Must not be exposed outside the LAN
- Docker image must be verified by pulling it before being documented
- ARM64 image required (Raspberry Pi target)

---

## Horizon

Out-of-scope ideas and future capabilities captured during discussion → [horizon.md](horizon.md)
