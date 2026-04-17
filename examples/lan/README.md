# Layer 0 LAN — Reference Example

Working reference implementation of the Layer 0 LAN stack.  
All four services deploy with a single `docker compose up -d`.

---

## Stack

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| AdGuard Home | lscr.io/linuxserver/adguardhome | 53 (UDP+TCP), 3000 (UI) | DNS filtering + local rewrites |
| Samba | lscr.io/linuxserver/samba | 139, 445 | LAN file sharing (SMB) |
| Uptime Kuma | lscr.io/linuxserver/uptime-kuma | 3001 | Uptime monitoring + alerts |
| PostgreSQL | lscr.io/linuxserver/postgresql | internal only | Shared database server |

---

## Pre-flight

### 1. Create your `.env`

```bash
cp .env.example .env
```

Edit `.env`:

- **PUID / PGID** — must match your Linux user. Run `id $(whoami)` and use the values shown.
- **TZ** — your timezone from the [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), e.g. `Europe/Paris`.
- **POSTGRES_PASSWORD** — change from the placeholder before starting.

### 2. Free port 53 (Linux / WSL with systemd)

> **`homelab-test` WSL distro**: no systemd → `systemd-resolved` is not running → port 53 is free. Skip this step.

On systems where systemd is PID 1 (most Ubuntu/Debian installs), `systemd-resolved` binds a stub listener on port 53. Disable it before starting AdGuard Home:

```bash
echo "DNSStubListener=no" | sudo tee -a /etc/systemd/resolved.conf
sudo systemctl restart systemd-resolved
```

Verify port 53 is free:

```bash
sudo ss -tulnp | grep ':53'
# Should return nothing (or only processes you control)
```

### 3. Create data directories

The data directories are excluded from git. Create them before first run:

```bash
mkdir -p data/media data/files data/backup data/postgres
```

---

## Running

### On a real Linux host (production target)

```bash
docker compose up -d
```

### On WSL2 (testing only)

Port 445 is owned by Windows and cannot be bound from WSL2. Use the provided override:

```bash
docker compose -f docker-compose.yml -f docker-compose.wsl.yml up -d
```

The override remaps Samba to ports `1139` / `4445` inside WSL so the rest of the stack still runs and can be verified. Samba share access in this mode uses `\\<WSL-IP>\sharename`.

To find your WSL IP:
```bash
ip addr show eth0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1
```

---

## Verification

```bash
# All containers running?
docker compose ps

# AdGuard Home web UI
# http://<host-ip>:3000  (first run: setup wizard)

# Uptime Kuma web UI
# http://<host-ip>:3001

# PostgreSQL responding?
docker exec -it postgres psql -U "${POSTGRES_USER:-postgres}" -c '\l'

# Samba shares visible? (from another machine on LAN)
# Windows: \\<host-ip>
# Linux:   smbclient -L //<host-ip> -N
```

---

## Stopping

```bash
docker compose down
# To also remove volumes (wipes all data):
docker compose down -v
```

---

## Notes

- AdGuard Home uses **host networking** so port 53 binds directly to the host NIC. This is intentional — see `decisions/layer_0_lan/dns.md`.
- PostgreSQL has **no published ports**. Other containers reach it via the `internal` bridge network by hostname `postgres`.
- Uptime Kuma uses **SQLite** — this is an explicit, time-limited exception documented in `decisions/layer_0_lan/monitoring.md`.
