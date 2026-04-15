# Windows Developer Setup — Testing with WSL + Docker

This guide walks through creating an **isolated WSL environment** on Windows for testing the HomeLab Docker Compose stack without affecting your main system.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Windows | 10 (22H2) or 11 | WSL 2 kernel required |
| WSL 2 | Any | See install step below |
| Disk space | ~4 GB free | For the WSL image |

---

## 1. Enable WSL 2

Open **PowerShell as Administrator** and run:

```powershell
wsl --install
wsl --set-default-version 2
```

Reboot if prompted.

---

## 2. Create an Isolated Test Distro

Do **not** use your primary WSL distro for testing — create a named, disposable instance instead.

### Option A — Fresh Ubuntu install (simplest)

```powershell
wsl --install -d Ubuntu-24.04
```

WSL will prompt you to set a username and password on first launch.

### Option B — Named import (recommended for repeatability)

This lets you create, destroy, and recreate the environment cleanly.

```powershell
# Export an existing distro as the base (skip if starting fresh)
wsl --export Ubuntu-24.04 C:\WSL\ubuntu-base.tar

# Create a named, isolated instance from that base
wsl --import homelab-test C:\WSL\homelab-test C:\WSL\ubuntu-base.tar --version 2
```

> **Tip:** You can delete and recreate this instance at any time with:
> ```powershell
> wsl --unregister homelab-test
> ```

---

## 3. Enter the Test Distro

```powershell
wsl -d homelab-test
```

All subsequent commands in this section are run **inside WSL**.

---

## 4. Install Docker Engine

```bash
# Update package index
sudo apt-get update

# Install Docker Engine via the official convenience script
curl -fsSL https://get.docker.com | sh

# Add your user to the docker group (avoids needing sudo for every docker command)
sudo usermod -aG docker $USER

# Apply group change in the current shell
newgrp docker

# Verify
docker compose version
```

---

## 5. Access the Project Files

Your Windows drive is automatically mounted inside WSL. No copying needed.

```bash
# Your project lives at:
cd /mnt/d/PROJECTS/GSA/HomeLab

# Confirm you can see the files
ls -la
```

> **Performance note:** For better I/O speed, clone the repo into the WSL filesystem instead:
> ```bash
> git clone <repo-url> ~/homelab
> cd ~/homelab
> ```

---

## 6. Run the Stack

```bash
# From the project root inside WSL
docker compose up -d

# Check running containers
docker compose ps

# Follow logs
docker compose logs -f

# Tear everything down when done
docker compose down -v
```

---

## 7. Cleanup

When you are done testing, remove the WSL instance entirely:

```powershell
# Back in Windows PowerShell
wsl --unregister homelab-test

# Optionally remove the disk image
Remove-Item -Recurse C:\WSL\homelab-test
```

---

## Troubleshooting

### `docker: command not found` after install

The Docker install script may require a shell restart:

```bash
exec bash
docker --version
```

### WSL 2 kernel not found

Run in PowerShell as Administrator:

```powershell
wsl --update
```

### Port conflicts with Docker Desktop

If Docker Desktop is also installed, stop it before starting Docker Engine inside WSL to avoid port binding conflicts.

---

## See Also

- [plan.md](../plan.md) — project architecture and layer model
- [decisions/platform-choice.md](../decisions/platform-choice.md) — why Docker Engine + Compose
- [WSL documentation](https://learn.microsoft.com/en-us/windows/wsl/)
- [Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
