# Test Environment — Arch Linux / SteamOS

Covers both a standard Arch Linux install and a Steam Deck running SteamOS (Arch-based). The Steam Machine is a primary hardware target for this project.

---

## Arch Linux (Standard)

### Install Docker

```bash
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
docker compose version
```

### Run the Stack

```bash
git clone https://github.com/guedouari/HomeLab.git
cd HomeLab/examples/lan
docker compose up -d
docker compose ps
```

---

## SteamOS (Steam Deck)

SteamOS uses an immutable read-only root filesystem. A few extra steps are required before installing anything.

### 1. Disable Read-Only Filesystem

```bash
sudo steamos-readonly disable
```

> Re-enable after setup with `sudo steamos-readonly enable`. SteamOS updates may re-enable it automatically.

### 2. Initialise pacman Keyring

```bash
sudo pacman-key --init
sudo pacman-key --populate archlinux
```

### 3. Install Docker

```bash
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

### 4. Run the Stack

```bash
git clone https://github.com/guedouari/HomeLab.git
cd HomeLab/examples/lan
docker compose up -d
```

---

## Gaming / Docker Coexistence (Steam Machine)

The Steam Machine is both a gaming PC and a self-hosted server. Key considerations:

- **Sablier** (Layer 2) stops idle services automatically — non-essential containers do not consume RAM/CPU during gaming sessions.
- Services that must always run (AdGuard, Gatus, WireGuard) are lightweight enough (~50 MB total RAM) to coexist with games.
- `docker compose stop` any layer group before a RAM-intensive gaming session if needed.

---

## Troubleshooting

**`docker.service` fails to start** — ensure the kernel has the required modules:

```bash
lsmod | grep overlay
modprobe overlay
```

**pacman keyring errors on SteamOS** — re-run `pacman-key --populate` after any SteamOS system update.
