# Test Environment — Windows (Podman Desktop)

> **Status:** Podman Desktop is not required — the WSL2 guide covers the recommended path. Use this if you prefer a rootless, daemon-free setup or already have Podman Desktop installed.

Podman Desktop runs a WSL2-backed Linux VM internally. `podman compose` is a drop-in for `docker compose` for most use cases, with one important difference: `network_mode: host` is not supported on Windows (it works inside the Podman VM, not on the Windows host).

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Windows 10 (22H2) or 11 | WSL2 must be enabled (`wsl --install`) |
| [Podman Desktop](https://podman-desktop.io/downloads) | Includes Podman + Compose support |

---

## 1. Install Podman Desktop

1. Download the installer from [podman-desktop.io/downloads](https://podman-desktop.io/downloads)
2. Run the installer — it installs Podman and creates a WSL2-backed Podman machine
3. Open Podman Desktop, click **Install** when prompted to initialise the Podman machine
4. Wait for the machine to reach **Running** state

Verify from PowerShell:

```powershell
podman --version
podman compose version
```

---

## 2. Open a Podman Machine Shell

All `podman` commands can run from PowerShell, but for cloning and file access it's easier to enter the Podman VM directly:

```powershell
podman machine ssh
```

---

## 3. Clone the Repo (inside the Podman VM)

```bash
git clone https://github.com/guedouari/HomeLab.git ~/homelab
cd ~/homelab
```

---

## 4. Run the Stack

The HomeLab examples use `network_mode: host` on Linux. Inside the Podman VM this works correctly. From PowerShell (outside the VM) it does not — use the WSL override file which replaces host networking with explicit port mappings:

```bash
# Inside the Podman VM shell
cd ~/homelab/examples/lan
cp .env.example .env

# Edit SERVER_IP to the Podman VM's IP
ip -4 addr show eth0 | grep inet

# Start with the WSL override (explicit ports instead of host networking)
podman compose -f docker-compose.yml -f docker-compose.wsl.yml up -d
podman compose -f docker-compose.yml -f docker-compose.wsl.yml ps
```

Or from PowerShell using the Windows path:

```powershell
cd path\to\HomeLab\examples\lan
copy .env.example .env
podman compose -f docker-compose.yml -f docker-compose.wsl.yml up -d
```

---

## 5. Teardown

```bash
podman compose -f docker-compose.yml -f docker-compose.wsl.yml down -v
```

Remove the Podman machine entirely:

```powershell
podman machine stop
podman machine rm
```

---

## Key Differences vs Docker Engine (WSL2)

| Behaviour | Docker Engine (WSL) | Podman Desktop |
|-----------|---------------------|----------------|
| `network_mode: host` | ✅ Works (Linux kernel) | ⚠️ Works inside VM only, not from Windows |
| Daemon | Required (`dockerd`) | No daemon (rootless) |
| Compose command | `docker compose` | `podman compose` |
| Rootless by default | No | Yes |
| Socket path | `/var/run/docker.sock` | `/run/user/1000/podman/podman.sock` |

For this project the WSL2 + Docker Engine path (see `windows-wsl.md`) is the most tested and recommended route on Windows.

