# Test Environment — Windows (WSL + Docker Engine)

Creates a disposable, isolated WSL distro for testing the HomeLab stack without touching your main system.

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Windows | 10 (22H2) or 11 | WSL 2 kernel required |
| WSL 2 | Any | `wsl --install` to enable |
| Disk space | ~4 GB free | For the WSL image |

---

## 1. Enable WSL 2

```powershell
wsl --install
wsl --set-default-version 2
```

Reboot if prompted.

---

## 2. Create an Isolated Test Distro

Do **not** use your primary distro — create a named, disposable instance.

```powershell
# Export an existing distro as the base
wsl --export Ubuntu-24.04 C:\WSL\ubuntu-base.tar

# Create a named isolated instance
wsl --import homelab-test C:\WSL\homelab-test C:\WSL\ubuntu-base.tar --version 2
```

Destroy and recreate at any time:

```powershell
wsl --unregister homelab-test
```

---

## 3. Enter the Distro

```powershell
wsl -d homelab-test
```

All steps below run **inside WSL**.

---

## 4. Remove Windows PATH from WSL

WSL appends your Windows `PATH` by default, causing Windows binaries (`node.exe`, `python.exe`) to shadow Linux ones.

```bash
sudo tee /etc/wsl.conf > /dev/null <<'EOF'
[interop]
appendWindowsPath = false
EOF
```

Restart the distro to apply:

```powershell
wsl --terminate homelab-test
wsl -d homelab-test
```

Verify:

```bash
echo $PATH   # should contain only Linux paths (/usr/local/sbin, /usr/bin, etc.)
```

---

## 5. Trust Corporate / Custom CA Certificates

Skip this if you are not behind a corporate HTTPS proxy or private registry.

```bash
sudo cp /mnt/c/path/to/your-corp-ca.crt /usr/local/share/ca-certificates/
sudo apt-get install -y ca-certificates
sudo update-ca-certificates
```

Docker Engine reads the system CA bundle, so image pulls from private registries will also trust the certificate.

---

## 6. Install Docker Engine

```bash
sudo apt-get update
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version
```

---

## 7. Run the Stack

```bash
cd /mnt/d/PROJECTS/GSA/HomeLab   # or clone into WSL-native path for better I/O

# Layer 0 (LAN)
cd examples/lan
docker compose up -d
docker compose ps

# With WSL port overrides
docker compose -f docker-compose.yml -f docker-compose.wsl.yml up -d
```

---

## 8. Teardown

```bash
docker compose down -v
```

Remove the distro entirely:

```powershell
wsl --unregister homelab-test
Remove-Item -Recurse C:\WSL\homelab-test
```

---

## Troubleshooting

**`docker: command not found` after install** — restart the shell: `exec bash`

**`wmdocker` suggested by apt** — ignore it, that is an unrelated Window Manager dock app.

**WSL 2 kernel not found** — run `wsl --update` as Administrator.

**Port conflicts with Docker Desktop** — stop Docker Desktop before starting Docker Engine inside WSL.
