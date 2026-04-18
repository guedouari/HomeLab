# Layer 3 — Services example

This is the full stack: Layers 0 + 1 + 2 + Nextcloud (files, contacts, calendar).

## What's included

| Service | Image | Purpose | Layer |
|---------|-------|---------|-------|
| Samba | `ghcr.io/servercontainers/samba` | LAN file sharing | 0 |
| AdGuard Home | `adguard/adguardhome` | DNS filtering | 0 |
| Gatus | `twinproduction/gatus` | Health dashboard | 0 |
| WireGuard | `linuxserver/wireguard` | VPN | 1 |
| **CrowdSec** | `crowdsecurity/crowdsec` | **IDS + community IP blocklist** | **1** |
| Cloudflare dynDNS | `timothyjmiller/cloudflare-ddns` | DNS A record updater | 2 |
| Sablier | `acouvreur/sablier` | On-demand containers | 2 |
| Caddy | `homelab-caddy` | Reverse proxy + TLS | 2 |
| **PostgreSQL** | `postgres:17` | Shared database | **3** |
| **Redis** | `redis:alpine` | Cache + file locking | **3** |
| **Nextcloud** | `nextcloud:fpm-alpine` | Files, contacts, calendar | **3** |
| **Nextcloud nginx** | `nginx:alpine` | HTTP frontend for FPM | **3** |

## Pre-flight

### 1. Apply host firewall baseline (required)

```bash
bash scripts/setup-firewall.sh
```

Sets iptables rules and prints bouncer install instructions for automatic IP banning (CrowdSec).

### 2. Build the custom Caddy image

```bash
docker build -f Dockerfile.caddy -t homelab-caddy .
```

### 3. DNS setup (Cloudflare)

Add A records:
- `homelab.example.com` → your public IP
- `vpn.homelab.example.com` → your public IP (Proxied: OFF)

Add CNAME records pointing to `homelab.example.com`:
- `adguard` → `homelab.example.com`
- `status` → `homelab.example.com`
- `nextcloud` → `homelab.example.com`

### 4. Router port-forwards

| Port | Protocol | To |
|------|----------|---|
| 80 | TCP | Caddy |
| 443 | TCP | Caddy |
| 51820 | UDP | WireGuard |

### 5. Cloudflare dynDNS config

```bash
cp config/cloudflare-ddns/cloudflare.json.example config/cloudflare-ddns/cloudflare.json
# Edit: fill in your API token and Zone ID
```

### 6. Create data directories

```bash
mkdir -p data/media data/files data/backup data/adguardhome data/gatus \
         data/wireguard data/crowdsec data/sablier data/caddy data/postgres data/redis
```

### 7. Copy layer configs

```bash
# Copy AdGuard and Gatus configs from Layer 0
cp -r ../lan/config/adguardhome ./config/
cp -r ../lan/config/gatus ./config/
```

### 8. Copy and edit `.env`

```bash
cp .env.example .env
# Edit all values — especially POSTGRES_PASSWORD, REDIS_PASSWORD,
# NEXTCLOUD_ADMIN_PASSWORD, DOMAIN, CLOUDFLARE_API_TOKEN, WIREGUARD_URL
```

### 8. Start

```bash
docker compose up -d
```

## First-start timeline

| Time | Event |
|------|-------|
| 0s | All containers start |
| ~10s | PostgreSQL and Redis ready |
| ~30-120s | Nextcloud installs (creates DB schema, admin user) |
| After install | Access `https://nextcloud.${DOMAIN}` |

Watch progress: `docker logs -f nextcloud`

## Nextcloud setup

After installation completes, log in with `NEXTCLOUD_ADMIN_USER` / `NEXTCLOUD_ADMIN_PASSWORD`.

Enable built-in apps in the Nextcloud app menu:
- **Contacts** — CardDAV sync
- **Calendar** — CalDAV sync
- **Notes** — markdown notes

### Mobile clients

| App | Platform | Protocol |
|-----|----------|---------|
| Nextcloud Files | iOS / Android | WebDAV |
| Nextcloud (official) | iOS / Android | All |
| iOS Contacts | iOS | CardDAV — Settings → Contacts → Accounts → Add account → Other |
| iOS Calendar | iOS | CalDAV — Settings → Calendar → Accounts → Add account → Other |
| DAVx⁵ | Android | CardDAV + CalDAV |

CardDAV/CalDAV server URL: `https://nextcloud.${DOMAIN}/remote.php/dav/`

## Background jobs (cron)

Add to the host's crontab (`crontab -e`):

```
*/5 * * * * docker exec --user www-data nextcloud php -f /var/www/html/cron.php
```

This runs Nextcloud background jobs (file indexing, notifications, cleanup) every 5 minutes.

## Backup

```bash
# Database
docker exec postgres pg_dumpall -U postgres > data/backup/db_$(date +%Y%m%d).sql

# Nextcloud data (user files)
# The nextcloud-data Docker volume contains user files — back it up with:
docker run --rm -v nextcloud-data:/source -v $(pwd)/data/backup:/dest \
  alpine tar czf /dest/nextcloud_$(date +%Y%m%d).tar.gz -C /source .
```
