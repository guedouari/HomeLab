# File Sharing — Testing & Verification

**This file is the gate. Status stays 🔍 Until every section below has a recorded result.**

---

## Environment

Record the environment where testing was performed:

| Item | Value |
|------|-------|
| Host OS | Windows 11 + WSL2 (`homelab-test` distro, Ubuntu-based) |
| Docker version | 29.4.0 |
| Compose version | v2 (plugin) |
| Image pulled | `ghcr.io/servercontainers/samba:latest` |
| Image digest | `sha256:155d384c4e3948f84ab8126647877bb409d7882a04173952bddf78fa547e1f9b` |
| smbd version | 4.22.8 |
| Date tested | 2025-04 |

---

## Step 1 — Image Pull

```bash
docker pull ghcr.io/servercontainers/samba:latest
docker inspect ghcr.io/servercontainers/samba:latest --format '{{.RepoDigests}}'
```

| Check | Result | Notes |
|-------|:------:|-------|
| Image pulls without error | ✅ | |
| Image is multi-arch (amd64 + arm64) | ✅ | Confirmed on ghcr.io manifest |
| Record digest above | ✅ | Digest in Environment table |

---

## Step 2 — Container Starts

```bash
docker compose up -d samba
docker compose ps samba
docker compose logs samba
```

| Check | Result | Notes |
|-------|:------:|-------|
| Container starts and stays running | ✅ | |
| No errors in logs | ✅ | wsdd2 `SO_RCVBUFFORCE` warning is non-fatal (needs `CAP_NET_ADMIN`) |
| Logs confirm shares were created | ✅ | `testparm -s` in logs shows all 3 shares, all `guest ok = yes` |
| Logs confirm no user accounts created | ✅ | No `ACCOUNT_` vars — pure guest |
| avahi starts | ✅ | `Service "HomeLab" successfully established`, hostname `HomeLab.local` |
| wsdd2 starts | ✅ | `exec /usr/sbin/wsdd2` + `starting.` in logs |
| nmbd (NetBIOS) starts | ✅ | `exec nmbd --foreground` in logs |

---

## Step 3 — Share Access from Linux (same host / WSL)

```bash
# All shares are guest — no credentials needed
# Run from inside the container (smbclient bundled in image):

# List shares
docker exec samba smbclient -L //127.0.0.1 -N

# Connect to any share (no -U needed)
docker exec samba smbclient //127.0.0.1/media -N -c 'ls'
docker exec samba smbclient //127.0.0.1/files -N -c 'ls'

# Write a test file
docker exec samba smbclient //127.0.0.1/media -N -c 'put /etc/hostname test.txt; ls'
```

**Note:** Share directories need permissions set after first start. Run once:
```bash
docker exec samba chmod -R 777 /shares
```

| Check | Result | Notes |
|-------|:------:|-------|
| Share list visible anonymously | ✅ | `media`, `files`, `backup`, `IPC$` listed |
| `media` accessible without credentials (guest) | ✅ | Linux/Android path |
| `files` accessible without credentials (guest) | ✅ | |
| `backup` accessible without credentials (guest) | ✅ | |
| `media` accessible as `homelab%homelab` | ✅ | Windows path |
| Unknown username maps to guest | ✅ | `nobody%anything` → gets in as guest |
| Wrong password for `homelab` is rejected | ✅ | `NT_STATUS_LOGON_FAILURE` (correct — not mapped to guest) |
| Write to `media` succeeds | ✅ | |
| Write to `files` succeeds | ✅ | |
| File readable after write | ✅ | |

---

## Step 4 — Share Access from Windows (user validation)

> **Deferred to user.** WSL2 blocks same-host testing (LanmanServer on port 445). Test from a separate machine or on target hardware.

No client configuration needed. Windows will prompt for credentials on first access:
- Username: `homelab`
- Password: value of `SAMBA_PASSWORD` (default: `homelab`)
- Check "Remember my credentials" → never prompted again

```
# File Explorer address bar or Run dialog (Win+R):
\\HomeLab.local\media     ← via avahi hostname (or use IP if avahi not working)
\\HomeLab.local\files
\\HomeLab.local\backup

# Or browse via Windows Network sidebar (wsdd2 → appears as "HomeLab")
```

```
# In Windows File Explorer address bar or Run dialog:
\\<host-ip>\media       ← should open without login prompt
\\<host-ip>\files       ← should prompt for credentials (alice / SAMBA_PASSWORD)

# Or check Windows Network in Explorer sidebar (wsdd2 discovery)
```

| Check | Result | Notes |
|-------|:------:|-------|
| Server appears in Windows Network browser | ⬜ | wsdd2 discovery |
| `media` opens without login prompt | ⬜ | guest ok |
| `files` prompts for credentials | ⬜ | |
| `files` accessible with alice credentials | ⬜ | |
| Cross-OS file visibility (write on Linux, read on Windows) | ⬜ | |

---

## Step 5 — Share Access from Android / iOS (user validation)

> **Deferred to user.** Requires a physical device.

Android: use any SMB client (e.g. Solid Explorer, FX File Explorer, VLC).  
iOS: open Files app → `...` → Connect to Server → `smb://<host-ip>`.

| Check | Result | Notes |
|-------|:------:|-------|
| `media` accessible from Android (guest) | ⬜ | |
| `media` accessible from iOS Files (guest) | ⬜ | |
| `files` accessible from Android with credentials | ⬜ | |

---

## Step 6 — Restart Persistence

```bash
docker compose restart samba
```

| Check | Result | Notes |
|-------|:------:|-------|
| Shares still accessible after restart | ✅ | `files` share listing works immediately after restart |
| Data written before restart still present | ✅ | `private.txt` still visible after restart |

---

## Issues Found

_Document any problems encountered during testing here, with the exact error and how it was resolved or whether it remains open._

| # | Description | Status | Resolution |
|---|-------------|:------:|-----------|
| 1 | Bind mounts to Windows NTFS (`/mnt/d/...`) cause `I/O error` inside Docker on WSL2 | ✅ resolved | Use WSL-native ext4 paths for volumes when testing on WSL |
| 2 | Share dirs created as root — nobody can write | ✅ resolved | `docker exec samba chmod -R 777 /shares` after first start |
| 3 | `smbclient` not in WSL distro | ✅ worked around | `docker exec samba smbclient` — image bundles it |
| 4 | WSL2: port 445 intercepted by `LanmanServer` from same Windows host | ⚠️ known limitation | Test Windows access from separate device. Not an issue on target hardware. |
| 5 | WSL2: Avahi/wsdd2 multicast doesn't propagate to LAN (NAT) | ⚠️ known limitation | Discovery only works on real hardware. |

---

## Result

✅ **Linux PASS** — all automated checks green (Steps 1–3 + 6). Steps 4–5 deferred to user validation on target hardware.

**Android/iOS:** not yet tested — requires a physical device on the same LAN.
