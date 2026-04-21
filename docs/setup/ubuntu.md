# Test Environment — Ubuntu (Direct / VM)

For testing on a bare Ubuntu install, VM, or VPS. No WSL layer — Docker Engine runs natively.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Ubuntu | 22.04 LTS or 24.04 LTS |
| Disk space | ~4 GB free |

---

## 1. Install Docker Engine

```bash
sudo apt-get update
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
docker compose version
```

---

## 2. Clone and Run

```bash
git clone https://github.com/guedouari/HomeLab.git
cd HomeLab/examples/lan
docker compose up -d
docker compose ps
```

No override file needed — `network_mode: host` works natively on Linux.

---

## 3. Teardown

```bash
docker compose down -v
```

---

## Troubleshooting

**`apt` suggests `wmdocker`** — ignore it. Install Docker Engine via the `get.docker.com` script only.

**Port 53 already in use** — Ubuntu 22.04+ ships `systemd-resolved` which binds to `127.0.0.53:53`. Disable it before running AdGuard:

```bash
sudo systemctl disable --now systemd-resolved
sudo rm /etc/resolv.conf
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

**Port 443/80 already in use** — check for `apache2` or `nginx` pre-installed on some cloud images:

```bash
sudo systemctl disable --now apache2 nginx
```
