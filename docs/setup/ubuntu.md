# Test Environment — Ubuntu (Direct / VM / VPS)

> **Status:** Steps written from reference. Not yet validated on this machine — mark as validated once tested on a native Ubuntu install.

For testing on a bare Ubuntu install, VM, or cloud VPS. No WSL layer — Docker Engine and `network_mode: host` work natively.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Ubuntu | 22.04 LTS or 24.04 LTS |
| Disk space | ~4 GB free |

---

## 1. Disable `systemd-resolved` (Ubuntu 22.04+)

Ubuntu 22.04 and later ship `systemd-resolved`, which binds a DNS stub to `127.0.0.53:53`. This conflicts with AdGuard Home.

```bash
sudo systemctl disable --now systemd-resolved
sudo rm /etc/resolv.conf
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

---

## 2. Install Docker Engine

```bash
sudo apt-get update
curl -fsSL https://get.docker.com | sh

sudo usermod -aG docker $USER
exec su -l $USER

# Verify
docker compose version   # should print Compose version v2.x or later
```

> **Note:** `apt` may suggest `wmdocker` — ignore it. That is an unrelated Window Manager dock applet, not Docker Engine. Always install Docker via the `get.docker.com` script.

---

## 3. Clone and Run

```bash
git clone https://github.com/guedouari/HomeLab.git ~/homelab
cd ~/homelab/examples/lan

cp .env.example .env
# Edit .env — set SERVER_IP to this machine's LAN IP:
ip -4 addr show | grep 'inet ' | grep -v '127.0.0.1'

# Start (no override file needed — network_mode: host works natively)
docker compose up -d
docker compose ps
```

Expected — all three services `Up`:

```
NAME           IMAGE                          STATUS
adguardhome    adguard/adguardhome:latest     Up
gatus          twinproduction/gatus:latest    Up
samba          dockurr/samba:latest           Up
```

Access points (replace with your machine's LAN IP):

| Service | URL | Default credentials |
|---------|-----|---------------------|
| AdGuard Home | `http://<SERVER_IP>:3000` | admin / homelab |
| Gatus dashboard | `http://<SERVER_IP>:8080` | — |
| Samba share | `\\<SERVER_IP>\data` | guest (no password) |

---

## 4. Teardown

```bash
docker compose down -v
```

---

## Troubleshooting

**Port 80/443 already in use** — check for pre-installed web servers on cloud images:

```bash
sudo systemctl disable --now apache2 nginx
```

**`docker: command not found` after install** — reload group membership: `exec su -l $USER`

**AdGuard crashes on startup** — port 53 is still in use. Verify `systemd-resolved` is stopped: `sudo systemctl is-active systemd-resolved` should print `inactive`.
