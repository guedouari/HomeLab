# Windows Deployment — Podman Desktop

> **Validated on:** Podman Desktop 1.x, Podman 5.8.2, Fedora 43 WSL2 VM, Windows 11  
> **Overview:** [Windows as a HomeLab Server](windows.md)

Runs the HomeLab stack inside Podman Desktop's WSL2-backed Fedora VM. Rootless, daemon-free alternative to the Docker Engine path. See the [overview guide](windows.md) if you're deciding between the two.

Podman Desktop runs a WSL2-backed Fedora VM (`podman-machine-default`). All container operations happen inside that VM. `network_mode: host` works correctly inside the VM, which means the WSL override file (`docker-compose.wsl.yml`) is required — the same as the Docker Engine + WSL2 path.

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| Windows 10 (22H2) or 11 | WSL2 kernel included |
| [Podman Desktop](https://podman-desktop.io/downloads) | Installs Podman + creates `podman-machine-default` WSL2 VM |

---

## 1. Install Podman Desktop

1. Download the installer from [podman-desktop.io/downloads](https://podman-desktop.io/downloads)
2. Run the installer — it installs Podman and creates a WSL2-backed Podman machine
3. Open Podman Desktop and click **Install** when prompted to initialise the Podman machine
4. Wait for the machine to reach **Running** state

Verify from PowerShell:

```powershell
podman --version          # should print 5.x
wsl -l -v                 # podman-machine-default should show Running
```

---

## 2. One-time VM Setup

Enter the Podman VM as root:

```powershell
wsl -d podman-machine-default --cd "~" -u root
```

### 2a. Fix DNS

The VM's default nameserver (`192.168.127.1`) requires the Podman Desktop GUI to be running. If you see DNS failures, override it:

```bash
echo 'nameserver 8.8.8.8' > /etc/resolv.conf
```

### 2b. Fix broken registries symlink

Podman Desktop creates a symlink that points to a Windows path, which causes I/O errors when starting containers:

```bash
# Check for the broken symlink
ls -la /etc/containers/registries.conf.d/

# Replace it with an empty placeholder
rm /etc/containers/registries.conf.d/999-podman-desktop-registries-from-host.conf
echo '# placeholder' > /etc/containers/registries.conf.d/999-podman-desktop-registries-from-host.conf
```

### 2c. Install podman-compose

`podman-compose` is not included in the Podman VM by default:

```bash
# Install the python3-dotenv dependency first
dnf install -y python3-dotenv

# Download the podman-compose script
curl -fsSL https://raw.githubusercontent.com/containers/podman-compose/main/podman_compose.py \
  -o /usr/local/bin/podman-compose
chmod +x /usr/local/bin/podman-compose

# Verify
podman-compose version
```

> **Note:** If you also have Rancher Desktop installed, `podman compose` (without hyphen) will be hijacked by Rancher Desktop's `docker-compose` binary. Use `podman-compose` (with hyphen) explicitly to use the native Podman compose.

---

## 3. Clone the Repo (inside the Podman VM)

> **Important:** Do not run the stack from the Windows filesystem (`/mnt/c/...` or `/mnt/d/...`). NTFS mounts cause I/O errors when Podman tries to create volumes. Clone into the VM's native filesystem instead.

```bash
# Inside the Podman VM (run: wsl -d podman-machine-default --cd "~" -u root)
git clone --depth 1 https://github.com/guedouari/HomeLab.git ~/homelab
cd ~/homelab/examples/lan
```

---

## 4. Configure Environment

```bash
cp .env.example .env

# Find the Podman VM's IP
ip -4 addr show eth0 | grep inet   # e.g. 192.168.143.14

# Set SERVER_IP to the VM's eth0 IP
sed -i 's/^SERVER_IP=.*/SERVER_IP=<vm-eth0-ip>/' .env
```

### Fix DNS filter bind address

The DNS filter service binds to `0.0.0.0:53` by default, which conflicts with the Podman VM's internal resolver (`10.255.255.254:53`). Update the config to bind to the VM's eth0 IP instead:

```bash
# Get your VM's eth0 IP (e.g. 192.168.143.14)
VM_IP=$(ip -4 addr show eth0 | grep -oP '(?<=inet )\d+\.\d+\.\d+\.\d+')
echo "VM IP: $VM_IP"

# Replace the 0.0.0.0 bind address in the dns.bind_hosts section
sed -i "s/^    - 0\.0\.0\.0$/    - $VM_IP/" config/adguardhome/AdGuardHome.yaml

# Verify
grep -A2 'bind_hosts' config/adguardhome/AdGuardHome.yaml
```

Create the data directories:

```bash
mkdir -p data/media data/files data/backup data/adguardhome data/gatus
```

---

## 5. Run the Stack

```bash
# Make sure DNS is set (survives restarts only if persisted)
echo 'nameserver 8.8.8.8' > /etc/resolv.conf

cd ~/homelab/examples/lan
podman-compose -f docker-compose.yml -f docker-compose.wsl.yml up -d
podman-compose -f docker-compose.yml -f docker-compose.wsl.yml ps
```

---

## 6. Verify Services

| Service | Check | Expected |
|---------|-------|----------|
| File sharing | `ss -tlnp \| grep 445` | smbd listening on 0.0.0.0:445 |
| DNS filter web UI | `curl -o /dev/null -w '%{http_code}' http://<vm-ip>:3000` | 302 (→ /install.html first run) |
| Monitoring dashboard | `curl -o /dev/null -w '%{http_code}' http://<vm-ip>:8082` | 200 |

Access the dashboards from Windows using the VM's IP (e.g. `192.168.143.14`):

- **Monitoring dashboard:** `http://192.168.143.14:8082`
- **DNS filter web UI:** `http://192.168.143.14:3000` (complete setup wizard on first run)

---

## 7. Teardown

```bash
podman-compose -f docker-compose.yml -f docker-compose.wsl.yml down
```

To also delete all data volumes:

```bash
podman-compose -f docker-compose.yml -f docker-compose.wsl.yml down -v
```

---

## Key Differences vs Docker Engine (WSL2)

| Behaviour | Docker Engine (WSL2) | Podman Desktop |
|-----------|----------------------|----------------|
| `network_mode: host` | ✅ Works natively | ✅ Works inside Podman VM |
| Running from Windows path | ✅ Works | ❌ NTFS I/O errors — clone inside VM |
| Daemon | Required (`dockerd`) | No daemon (rootless) |
| Compose command | `docker compose` | `podman-compose` (hyphen) |
| Rootless by default | No | Yes |
| DNS in VM | System resolver | Needs `8.8.8.8` override if GUI not running |
| Registries symlink fix | Not needed | Required (broken NTFS symlink) |

---

## Troubleshooting

### DNS resolution fails inside the VM
The default nameserver `192.168.127.1` is provided by the Podman Desktop virtual network. If Podman Desktop GUI is not running, DNS fails.
```bash
echo 'nameserver 8.8.8.8' > /etc/resolv.conf
```

### `podman compose` uses Rancher Desktop's binary
If Rancher Desktop is installed, `podman compose` (without hyphen) is hijacked by Rancher Desktop's `docker-compose.exe`, which connects to Rancher Desktop's Docker daemon (not Podman). Use `podman-compose` (with hyphen) instead to use the native Podman compose.

### I/O errors on volume mounts
Running `podman-compose` from a Windows path (e.g. `D:\Projects\...`) causes `statfs` I/O errors because the Podman VM cannot access NTFS mounts reliably. Solution: clone the repo into the VM's native filesystem (`~/homelab`).

### DNS filter exits immediately (port 53 conflict)
The Podman VM's internal resolver binds to `10.255.255.254:53`. If the DNS filter container tries to bind to `0.0.0.0:53`, it will conflict and exit silently with code 1. Fix: update the DNS filter config to bind to the VM's specific eth0 IP (see Step 4).

### Container shows "Up Less than a second" repeatedly
This is the `restart: unless-stopped` policy restarting the container after a crash. Check `podman logs <container>` immediately after the container starts to capture the exit reason.

