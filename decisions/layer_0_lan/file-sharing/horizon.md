# File Sharing — Horizon

Ideas and capabilities outside the current scope that came up during discussion. Kept here so nothing is lost. Each entry documents what Samba specifically can offer in that context.

---

## NetBIOS / Network Discovery

**What it is:** Automatic share discovery — shares appear in Windows Explorer's "Network" view and macOS Finder's sidebar without typing an IP address.

**What Samba offers:**
- **NetBIOS** (`nmbd`) — legacy Windows name resolution and browsing. Works on local subnet only. Samba runs `nmbd` alongside `smbd` and can advertise itself. Requires UDP ports 137–138 on the host network (not bridge NAT).
- **WSD / wsdd2** — Web Services for Devices; modern Windows 10/11 network discovery. `servercontainers/samba` bundles `wsdd2`. Needs `CAP_NET_ADMIN` capability and host or macvlan networking to function.
- **mDNS / Avahi** — Bonjour/zeroconf; used by macOS Finder and some Android/iOS SMB clients. `servercontainers/samba` bundles `avahi`. Also requires host or macvlan networking.

**Why deferred:** All three discovery mechanisms need the container to be on the host network or have its own LAN IP (macvlan). Bridge + port mapping breaks them. Solving this at Layer 0 would mean either switching to host networking (less isolation) or setting up macvlan (significant router/switch complexity). Direct IP access is the documented workaround for now.

**Revisit trigger:** Discovery becomes genuine friction — e.g. the Smart TV or Android app has no way to manually enter a server address.

---

## Time Machine (macOS Backups)

**What it is:** Using the Samba server as a Time Machine backup destination for macOS devices.

**What Samba offers:**
- `servercontainers/samba` includes the `vfs_fruit` module, which implements the Apple Filing Protocol extensions over SMB (AFP-over-SMB).
- A Time Machine share is declared with `fruit:time machine = yes` in the share config — a single env var addition.
- Optional size cap: `fruit:time machine max size = 500G`.
- Per-user Time Machine shares work with `path = /shares/timemachine/%U` — each user gets their own subdirectory automatically.
- Avahi advertisement (Bonjour) is needed for Time Machine auto-discovery; without it, the share must be mounted manually in Finder before adding it in Time Machine settings.

**Why deferred:** No macOS device in the current [device matrix](../../device-support-matrix.md). When one is added, this is a small config addition with no architectural change required.

---

## Per-User Home Directories

**What it is:** Each authenticated user gets their own private share, automatically created on first login.

**What Samba offers:**
- `path = /shares/homes/%U` — Samba substitutes `%U` with the connecting username. The directory is created automatically if it does not exist (with correct permissions).
- The share name seen by the client is still a single name (e.g. `homes`) but each user lands in their own subdirectory.
- Works with any number of `ACCOUNT_<username>` env vars — no per-user share config needed.

**Why deferred:** Adds complexity to the share layout before the basic layout is even validated. One shared `files` share is simpler to test and reason about at Layer 0.

---

## Network Boot / PXE

**What it is:** Serving boot images over the network so devices can install or boot an OS without physical media.

**What Samba offers:**
- Samba is **not a PXE/TFTP server** — this is outside its scope.
- However, Samba can serve Windows PE images and answer `\\server\reminst` shares used in older Windows Deployment Services (WDS) setups.
- For modern PXE (Linux, Windows), a TFTP server (e.g. `dnsmasq` in TFTP mode, or a dedicated `tftp-hpa` container) combined with an HTTP server for iPXE is the standard approach. Samba plays no role in the boot process itself.

**Why noted:** Came up in the context of what a NAS-like home server could do. Entirely separate capability stack from file sharing — would be its own service decision if ever pursued.

---

## Disk Quotas

**What it is:** Limiting how much storage each share or user can consume.

**What Samba offers:**
- Samba itself does not enforce quotas — it relies on the **underlying filesystem** quota support (Linux `quota` tools, XFS project quotas, ZFS dataset quotas).
- `fruit:time machine max size` is the one built-in size cap — Time Machine shares only.
- For general quota enforcement, the host filesystem must be configured with quotas and Samba will respect them transparently.
- `servercontainers/samba` running on a Docker volume does not have quota tooling available inside the container — quota configuration must happen at the host level.

**Why deferred:** Requires host-level filesystem setup outside of Docker Compose. Not relevant until storage pressure is an actual problem.

---

## Read-Only Guest Media Share

**What it is:** Guests can browse and stream from `media` but cannot write — only authenticated users can add or delete files.

**What Samba offers:**
- Straightforward config split: one read-only share for guests + one read-write share for authenticated users pointing to the same path.
- Example:
  ```
  [media]        path = /shares/media; guest ok = yes; read only = yes
  [media-write]  path = /shares/media; valid users = alice; read only = no; browseable = no
  ```
- Or a single share with `read list` and `write list` directives.

**Why deferred:** The current proposed design allows guest writes to `media` for simplicity (Smart TV, Steam Deck can drop files). Restricting writes is a one-line config change — validate basic access first, then tighten if needed.
