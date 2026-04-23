# Windows as a HomeLab Server

> **Validated on:** Windows 10 (22H2) and Windows 11  
> **Deployment paths:** WSL2 + Docker Engine · Podman Desktop

Running HomeLab on a Windows machine is a first-class supported deployment path. The most common scenario is a gaming PC or spare laptop running Windows where you want self-hosted services without wiping the OS.

---

## Why Windows?

| Scenario | Notes |
|----------|-------|
| Gaming PC doing double duty | Keep Windows for gaming; run services in the background via WSL2 |
| Spare Windows machine | Don't wipe it — run the full stack inside WSL2 |
| Gradual migration | Try self-hosting before committing to a Linux-only server |
| Corporate or hybrid environment | Windows workstation that also needs to serve files or monitoring |

The stack runs inside a Linux VM (WSL2-backed), so all containers behave the same as on a native Linux host. `network_mode: host` works correctly inside the VM, which is why the WSL override file (`docker-compose.wsl.yml`) exists and is required for all Windows deployments.

---

## Deployment Paths

Two paths are fully validated. Choose one based on your setup:

| | **WSL2 + Docker Engine** | **Podman Desktop** |
|---|---|---|
| Runtime | Docker Engine inside Ubuntu 24.04 WSL2 distro | Podman inside Fedora 43 WSL2 VM |
| Compose command | `docker compose` | `podman-compose` (hyphen) |
| Daemon | Required (`dockerd`, starts with systemd) | None — rootless, daemon-free |
| Setup complexity | Low | Medium (extra one-time steps) |
| Socket path | `/var/run/docker.sock` | `\\.\pipe\podman-machine-default` |
| Works from Windows path | No — NTFS I/O errors, must use WSL filesystem | No — same constraint |
| Rancher Desktop conflict | `docker-credential-secretservice` breaks pulls | `podman compose` (no hyphen) hijacked — use `podman-compose` |
| Validated | ✅ BACK-6 | ✅ BACK-7 |

**Choose WSL2 + Docker Engine if** you want the simplest path, are familiar with Docker, or don't already have Podman Desktop installed.

**Choose Podman Desktop if** you prefer rootless containers, already have Podman Desktop installed, or want daemon-free operation.

---

## Common Constraints (Both Paths)

These apply regardless of which deployment path you choose:

### Port conflicts

| Port | Owned by | Impact | Fix |
|------|----------|--------|-----|
| 445 | Windows `LanmanServer` | SMB file sharing: container binds but Windows blocks inbound | Test from another LAN device or inside WSL with `smbclient` |
| 53 | Windows DNS stub (WSL2) / Podman internal resolver (`10.255.255.254`) | DNS filter container will conflict if it binds `0.0.0.0:53` | Bind DNS filter to the VM's eth0 IP only |
| 8080 | `wslrelay.exe` (WSL2 path) | Monitoring services will conflict | Use alternate port (e.g. 8082) via WSL override |
| 3000 | Usually free | DNS filter web UI | Verify with `ss -tlnp \| grep 3000` inside the VM |

### NTFS filesystem

The Podman VM and WSL2 distros cannot reliably access the Windows filesystem (`/mnt/c/...`, `/mnt/d/...`) for container volume mounts. `statfs` calls fail with I/O errors. **Always clone the repo and run the stack from inside the VM's native filesystem** (e.g. `~/homelab`).

### Service discovery

mDNS (Avahi) and WSD (wsdd2) multicast traffic does not propagate through the WSL2 NAT to the real LAN. Network device discovery only works reliably on real hardware. On Windows, discovery is limited to devices inside the same WSL2 network unless bridged.

### DNS persistence

DNS overrides inside the VM (e.g. `echo 'nameserver 8.8.8.8' > /etc/resolv.conf`) do **not** survive a VM restart. See the persistent DNS section in each guide.

---

## Permanent Server Setup

For a server that should keep running after reboots and across Windows sessions:

### Auto-start WSL2 services (Docker Engine path)

Create a scheduled task that starts the WSL distro at Windows login:

```powershell
# Run once from PowerShell (admin not required)
$action  = New-ScheduledTaskAction -Execute "wsl.exe" -Argument "-d homelab-server -u root -- systemctl start docker"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "HomeLab WSL Start" -Action $action -Trigger $trigger -RunLevel Highest
```

Or use a startup script that enters the distro and starts compose:

```powershell
wsl -d homelab-server -- bash -c "cd ~/homelab/examples/lan && docker compose -f docker-compose.yml -f docker-compose.wsl.yml up -d"
```

### Auto-start Podman Desktop path

Podman Desktop installs a Windows service (`Podman Machine`) that starts the VM on boot. Enable it from Podman Desktop → Preferences → Start Podman Machine automatically.

For compose services, add a startup script (same pattern as above but using `wsl -d podman-machine-default`).

### Keeping services alive

Both paths use `restart: unless-stopped` in the Compose files. Services restart automatically after a crash. After a Windows reboot, they need to be started once (manually or via scheduled task).

### Persistent DNS in Podman VM

The Podman VM loses its DNS override on restart. Add a startup script inside the VM or use a `wsl.conf` override:

```bash
# Inside podman-machine-default, add to /etc/profile.d/dns-fix.sh:
echo 'nameserver 8.8.8.8' > /etc/resolv.conf
```

---

## Networking Overview

```
Windows host
├── WSL2 virtual switch  (NAT — default gateway 172.x.x.1)
│   └── WSL2 distro / Podman VM
│       ├── eth0: 172.x.x.x  (WSL2) or 192.168.143.x (Podman)
│       ├── network_mode: host  → containers share VM's network
│       └── services bind to 0.0.0.0 (except DNS — bind to eth0 IP)
└── Physical NIC  →  home LAN
    └── Windows port proxy (optional) or mirrored networking (Win 11)
        forwards LAN traffic into WSL2
```

**Accessing services from the LAN:**

- **Windows 11 with mirrored networking** (`[wsl2] networkingMode=mirrored` in `.wslconfig`): services bind directly to the Windows host IP; accessible from LAN without extra config.
- **Windows 10 / standard NAT mode**: use `netsh interface portproxy` to forward LAN ports into WSL2, or access via the WSL2 IP from other LAN devices that can route to it.

---

## Detailed Guides

| Guide | Path | Status |
|-------|------|--------|
| [WSL2 + Docker Engine](windows-wsl.md) | Ubuntu 24.04 inside WSL2 | ✅ Validated |
| [Podman Desktop](windows-podman.md) | Fedora 43 inside Podman VM | ✅ Validated |
