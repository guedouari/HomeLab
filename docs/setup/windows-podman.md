# Test Environment — Windows (Podman Desktop)

Alternative to Docker Engine for testing on Windows. Podman Desktop uses a WSL2-backed VM internally — no daemon, rootless by default.

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Windows 10 (22H2) or 11 | WSL 2 must be enabled |
| [Podman Desktop](https://podman-desktop.io) | Installs Podman + Compose support |

---

## 1. Install Podman Desktop

Download and run the installer from [podman-desktop.io](https://podman-desktop.io).

On first launch, Podman Desktop will:
- Install a WSL2-backed Podman machine (`podman machine init`)
- Start the machine automatically

Verify from PowerShell:

```powershell
podman version
podman compose version
```

---

## 2. Clone the Repo

```powershell
git clone https://github.com/guedouari/HomeLab.git
cd HomeLab
```

---

## 3. Run the Stack

Podman is mostly a drop-in for Docker Compose. Use `podman compose` instead of `docker compose`:

```powershell
cd examples\lan
podman compose up -d
podman compose ps
```

---

## Known Differences vs Docker Engine

| Behaviour | Docker Engine | Podman |
|-----------|--------------|--------|
| `network_mode: host` | Works on Linux | **Not supported on Windows** — use explicit port mappings |
| Daemon | Required | No daemon (rootless) |
| Compose command | `docker compose` | `podman compose` |
| Socket path | `/var/run/docker.sock` | `/run/user/1000/podman/podman.sock` |

For `network_mode: host` services (all Layer 0 examples use this on Linux), run the WSL override file:

```powershell
podman compose -f docker-compose.yml -f docker-compose.wsl.yml up -d
```

---

## Teardown

```powershell
podman compose down -v
```

To remove the Podman machine entirely:

```powershell
podman machine stop
podman machine rm
```
