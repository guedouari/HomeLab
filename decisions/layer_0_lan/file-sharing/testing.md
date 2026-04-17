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
| No errors in logs | ✅ | "Bad password" warning for `homelab` (similar to hostname) but accepted; wsdd2 `SO_RCVBUFFORCE` warning is non-fatal |
| Logs confirm shares were created | ✅ | `testparm -s` in logs shows all 3 shares |
| Logs confirm user accounts were created | ✅ | `alice` user created in logs |
| wsdd2 starts | ✅ | `exec /usr/sbin/wsdd2` + `starting.` in logs |

---

## Step 3 — Share Access from Linux (same host / WSL)

```bash
# List shares anonymously
smbclient -L //127.0.0.1 -N

# Connect to the public media share (no credentials)
smbclient //127.0.0.1/media -N

# Connect to the private files share
smbclient //127.0.0.1/files -U alice%<password>

# Write a test file
smbclient //127.0.0.1/media -N -c 'put /etc/hostname test-hostname.txt'

# Read it back
smbclient //127.0.0.1/media -N -c 'get test-hostname.txt /tmp/test-hostname.txt' && cat /tmp/test-hostname.txt
```

**Note:** `smbclient` is not available in the WSL distro. All Linux tests run via `docker exec samba smbclient ...` from inside the container (image includes smbclient).

**Note:** Bind mounts to Windows NTFS (`/mnt/d/...`) cause I/O errors inside Docker on WSL2. Volumes must be on the WSL-native ext4 filesystem. See Issues table.

**Note:** Share directories need permissions set after first start — the image does not pre-set them. Run once:
```bash
docker exec samba sh -c "
  chmod 777 /shares/media
  chown -R alice:alice /shares/files /shares/backup
  chmod 770 /shares/files /shares/backup
"
```

| Check | Result | Notes |
|-------|:------:|-------|
| Share list visible anonymously | ✅ | `media`, `files`, `backup`, `IPC$` listed |
| `media` accessible without credentials | ✅ | guest ok = yes works |
| `files` requires credentials | ✅ | unknown user → `NT_STATUS_ACCESS_DENIED` |
| `files` accessible with correct credentials | ✅ | `alice%homelab` succeeds |
| `files` rejected with wrong credentials | ✅ | `NT_STATUS_LOGON_FAILURE` |
| Write to `media` succeeds | ✅ | after chmod 777 |
| Write to `files` succeeds | ✅ | after chown alice |
| Write to `backup` succeeds | ✅ | after chown alice |
| File readable after write | ✅ | `ls` shows file with correct size |

---

## Step 4 — Share Access from Windows (user validation)

> **Deferred to user.** Automated testing is blocked on WSL2 — `LanmanServer` intercepts port 445 on all interfaces including the WSL2 virtual adapter. Test this from a separate machine or on target hardware.

Get the host IP (on real hardware: `ip -4 addr show eth0`).

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
| 1 | Bind mounts to Windows NTFS (`/mnt/d/...`) cause `I/O error` inside Docker on WSL2 | ✅ resolved | Use WSL-native ext4 paths (e.g., `/root/homelab-test/data/`) for volume bind mounts when testing on WSL |
| 2 | Share directories created as root:root — Samba users can't write | ✅ resolved | Run `chmod`/`chown` via `docker exec` after first start (see Step 3 note) |
| 3 | `smbclient` not installed in WSL distro | ✅ worked around | Use `docker exec samba smbclient` — image bundles smbclient |
| 4 | Windows `net view`/File Explorer can't reach `\\<WSL-IP>\share` from same host | ⚠️ known limitation | `LanmanServer` intercepts port 445 on all interfaces in WSL2. Test from a separate LAN machine. Not an issue on target hardware. |

---

## Result

✅ **Linux PASS** — all automated checks green (Steps 1–3 + 6). Steps 4–5 deferred to user validation on target hardware.

**Android/iOS:** not yet tested — requires a physical device on the same LAN.
