# Test Environment — Arch Linux / SteamOS

> **Status:** Steps written from reference. Not yet validated — mark as validated once tested on real hardware.

Covers both a standard Arch Linux install and a Steam Deck running SteamOS (Arch-based). The Steam Machine is a primary hardware target for this project.

---

## Arch Linux (Standard)

### 1. Install Docker

```bash
sudo pacman -S --noconfirm docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
exec su -l $USER

# Verify
docker compose version
```

### 2. Clone and Run

```bash
git clone https://github.com/guedouari/HomeLab.git ~/homelab
cd ~/homelab/examples/lan

cp .env.example .env
# Edit .env — set SERVER_IP to this machine's LAN IP:
ip -4 addr show | grep 'inet ' | grep -v '127.0.0.1'

docker compose up -d
docker compose ps
```

No override file needed — `network_mode: host` works natively on Linux.

---

## SteamOS (Steam Deck)

SteamOS uses an **immutable read-only root filesystem**. A few extra steps are required before installing anything with pacman.

### 1. Unlock the Filesystem

```bash
sudo steamos-readonly disable
```

> Re-enable after setup: `sudo steamos-readonly enable`
> SteamOS system updates re-enable it automatically — you will need to repeat this step after major updates.

### 2. Initialise the Pacman Keyring

```bash
sudo pacman-key --init
sudo pacman-key --populate archlinux
```

### 3. Install Docker

```bash
sudo pacman -S --noconfirm docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
exec su -l $USER
```

### 4. Re-lock the Filesystem

```bash
sudo steamos-readonly enable
```

### 5. Clone and Run

```bash
git clone https://github.com/guedouari/HomeLab.git ~/homelab
cd ~/homelab/examples/lan

cp .env.example .env
# Set SERVER_IP to the Steam Deck's LAN IP
ip -4 addr show | grep 'inet ' | grep -v '127.0.0.1'

docker compose up -d
docker compose ps
```

---

## Gaming / Docker Coexistence (Steam Machine)

The Steam Machine is both a gaming PC and a self-hosted server. Key considerations:

- **Sablier** (Layer 2) stops idle services automatically — non-essential containers do not consume RAM/CPU during active gaming sessions
- Services that must always run (AdGuard, Gatus, WireGuard) are lightweight (~50 MB total RAM) and safe to leave running
- Stop any layer before a RAM-intensive game if needed: `docker compose -f examples/lan/docker-compose.yml stop`

---

## Troubleshooting

**`docker.service` fails to start** — ensure kernel overlay module is loaded:

```bash
lsmod | grep overlay
sudo modprobe overlay
```

**Pacman keyring errors after a SteamOS update** — re-run after unlocking:

```bash
sudo steamos-readonly disable
sudo pacman-key --populate archlinux
```

**`pacman: error: could not lock database`** — another pacman process is running. Wait and retry, or `sudo rm /var/lib/pacman/db.lck`.
