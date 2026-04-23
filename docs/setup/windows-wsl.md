# Windows Deployment — WSL2 + Docker Engine

> **Validated on:** Ubuntu 24.04 LTS inside WSL2, Docker Engine 29.4, Compose v5.1  
> **Overview:** [Windows as a HomeLab Server](windows.md)

Runs the HomeLab stack inside an Ubuntu 24.04 WSL2 distro on your Windows machine. Suitable for both permanent server deployments and disposable test environments. The optional "named distro" step in section 3 creates an isolated instance you can destroy and recreate cleanly — skip it for a permanent setup and run directly in your main Ubuntu distro.

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Windows 10 (22H2) or 11 | WSL2 kernel included |
| ~4 GB free disk | For the distro image |

---

## 1. Enable WSL2

Open **PowerShell as Administrator**:

```powershell
wsl --install
wsl --set-default-version 2
```

Reboot when prompted, then verify:

```powershell
wsl --version   # should show WSL version 2.x
```

---

## 2. Install Ubuntu 24.04

```powershell
wsl --install -d Ubuntu-24.04
```

WSL will prompt you for a UNIX username and password on first launch. Set them and exit back to PowerShell.

---

## 3. Create a Named, Disposable Test Distro

Working directly in Ubuntu-24.04 is fine for a quick test, but creating a separate named instance means you can destroy and recreate it cleanly without affecting your Ubuntu install.

```powershell
# Save Ubuntu-24.04 as a reusable base image (only needed once)
New-Item -ItemType Directory -Force C:\WSL | Out-Null
wsl --export Ubuntu-24.04 C:\WSL\ubuntu-24-base.tar

# Create the isolated test instance
wsl --import homelab-test C:\WSL\homelab-test C:\WSL\ubuntu-24-base.tar --version 2
```

To destroy and recreate:

```powershell
wsl --unregister homelab-test
wsl --import homelab-test C:\WSL\homelab-test C:\WSL\ubuntu-24-base.tar --version 2
```

---

## 4. Configure the Distro

Enter the distro:

```powershell
wsl -d homelab-test
```

All steps from here run **inside WSL**.

Create `/etc/wsl.conf` with three settings in one go:

```bash
sudo tee /etc/wsl.conf > /dev/null <<'EOF'
[boot]
systemd=true

[user]
default=YOUR_USERNAME

[interop]
appendWindowsPath = false
EOF
```

Replace `YOUR_USERNAME` with the UNIX user you created in step 2.

> **Why each setting:**
> - `systemd=true` — required for `systemctl enable docker` (without this, Docker doesn't start on boot)
> - `default=` — ensures you land as your user, not root, when entering the distro
> - `appendWindowsPath = false` — prevents Windows binaries (`node.exe`, `python.exe`) shadowing Linux ones

Restart the distro to apply all settings:

```powershell
# Back in PowerShell
wsl --terminate homelab-test
wsl -d homelab-test
```

Verify:

```bash
# systemd is running
systemctl is-system-running   # should print "running" or "degraded" (not "offline")

# PATH contains only Linux paths
echo $PATH    # /usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

---

## 5. (Optional) Trust a Corporate CA Certificate

Skip this unless you are behind a corporate HTTPS proxy or private Docker registry.

```bash
sudo cp /mnt/c/path/to/corp-ca.crt /usr/local/share/ca-certificates/
sudo apt-get install -y ca-certificates
sudo update-ca-certificates
```

Docker Engine reads the system CA bundle automatically.

---

## 6. Install Docker Engine

```bash
sudo apt-get update
curl -fsSL https://get.docker.com | sh

# Allow your user to run docker without sudo
sudo usermod -aG docker $USER

# Apply group change without logging out
exec su -l $USER

# Verify
docker compose version   # should print Compose version v2.x or later
```

> **Note:** `newgrp docker` works in some shells but can drop you into a subshell that loses your environment. `exec su -l $USER` is more reliable.

---

## 7. Clone the Repo (WSL-native path — required for I/O)

The Windows drive mount (`/mnt/d/...`) causes I/O errors inside containers due to NTFS. Always clone into the WSL filesystem:

```bash
git clone https://github.com/guedouari/HomeLab.git ~/homelab
cd ~/homelab
```

---

## 8. Run the Stack

```bash
cd ~/homelab/examples/lan

# Copy the example env file
cp .env.example .env
# Edit SERVER_IP to your WSL2 IP:
ip -4 addr show eth0 | grep inet   # note the IP, e.g. 172.28.5.42
# Then edit .env: SERVER_IP=172.28.5.42

# Start with WSL overrides (remaps conflicting ports)
docker compose -f docker-compose.yml -f docker-compose.wsl.yml up -d

# Check all three services are running
docker compose -f docker-compose.yml -f docker-compose.wsl.yml ps
```

Expected output — all three services `Up`:

```
NAME           IMAGE                          STATUS
adguardhome    adguard/adguardhome:latest     Up
gatus          twinproduction/gatus:latest    Up
samba          dockurr/samba:latest           Up
```

Access points (replace IP with your WSL2 eth0 address):

| Service | URL | Default credentials |
|---------|-----|---------------------|
| AdGuard Home | `http://<WSL-IP>:3000` | admin / homelab |
| Gatus dashboard | `http://<WSL-IP>:8081` | — |
| Samba share | `\\<WSL-IP>\data` | guest (no password) |

> **Port 8081 for Gatus:** the WSL override remaps Gatus from 8080 (used by `wslrelay.exe`) to 8081.
> **Port 445 for Samba:** Windows `LanmanServer` owns port 445; Samba binds inside the container but Windows blocks inbound connections. Test Samba from another device on the LAN, or from inside WSL with `smbclient -L //127.0.0.1 -N`.

---

## 9. Teardown

```bash
docker compose -f docker-compose.yml -f docker-compose.wsl.yml down -v
```

Remove the distro entirely when done:

```powershell
wsl --unregister homelab-test
Remove-Item -Recurse C:\WSL\homelab-test
```

---

## Troubleshooting

**`docker: command not found` after install** — run `exec su -l $USER` to reload group membership.

**`apt` suggests `wmdocker`** — ignore it. That is an unrelated Window Manager dock applet, not Docker Engine.

**`systemctl` not found / "System has not been booted with systemd"** — `systemd=true` is missing from `/etc/wsl.conf`, or the distro wasn't restarted after adding it. Run `wsl --terminate homelab-test` from PowerShell, then re-enter.

**WSL2 kernel not found** — run `wsl --update` in PowerShell as Administrator.

**I/O errors from containers** — you are running from `/mnt/d/...`. Clone the repo into `~/homelab` instead (WSL-native ext4 path).

**Port conflicts** — always use the `-f docker-compose.wsl.yml` override. It handles the known port conflicts (Gatus→8081, AdGuard→3000).

