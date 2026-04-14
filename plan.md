# HomeLab — Architecture Plan

This document is the living design specification. It gets updated as decisions are made, options are evaluated, and implementation progresses. Think of it as the engineering brain behind the README.

---

## Table of Contents

1. [Goals & Constraints](#1-goals--constraints)
2. [Network Architecture](#2-network-architecture)
3. [DNS Strategy](#3-dns-strategy)
4. [Reverse Proxy Decision](#4-reverse-proxy-decision)
5. [On-Demand Services with Sablier](#5-on-demand-services-with-sablier)
6. [Container Layout & Docker Networks](#6-container-layout--docker-networks)
7. [Service Catalogue](#7-service-catalogue)
8. [Nextcloud Deep Dive](#8-nextcloud-deep-dive)
9. [Storage Strategy](#9-storage-strategy)
10. [Security Model](#10-security-model)
11. [Hardware Profiles](#11-hardware-profiles)
12. [Phase Roadmap](#12-phase-roadmap)
13. [Open Questions](#13-open-questions)

---

## 1. Goals & Constraints

### Hard Requirements
- **On-demand containers** — non-essential services must not consume CPU/RAM while idle. A gaming session on the same machine cannot be impacted.
- **Unified domain access** — `service.home.example.com` resolves and works identically on LAN and over WAN (no split-brain config on clients).
- **LAN segregation** — Samba shares and Pi-hole admin UI must never be reachable from the public internet, regardless of reverse proxy configuration.
- **ARM + x86 support** — all chosen images must publish multi-arch manifests (linux/amd64 + linux/arm64).

### Strong Preferences
- Minimal moving parts in the core stack (core must survive a Pi reboot reliably).
- Infrastructure-as-code — everything reproducible from the repo, no manual click-ops.
- Single `.env` file drives all secrets/domain names.

### Non-Goals (for now)
- Kubernetes / K3s — overkill for a single-node home server.
- High availability / clustering.
- Paid cloud services as a dependency.

---

## 2. Network Architecture

```
Internet
    │
    ▼
[Router / ISP modem]
    │  port 80/443 → Server LAN IP
    │  WireGuard port (51820) → Server LAN IP
    │
    ▼
[Home Server]
    ├── eth0 / wlan0  (LAN: 192.168.1.x)
    │
    ├─── Docker: proxy-net  (Caddy/SWAG ↔ exposed services)
    ├─── Docker: internal-net  (service ↔ service, no host exposure)
    └─── Docker: lan-net  (Pi-hole, host-mode or macvlan for DNS)
```

### Key Points
- The server needs a **static LAN IP** (assign via router DHCP reservation).
- Port forwarding: only **80** and **443** (HTTP/HTTPS) and **51820** (WireGuard UDP) are forwarded from the router.
- Samba uses ports 445/139 — these are only open on the LAN interface, never forwarded.
- Pi-hole DNS (port 53) — served on the LAN interface only.

### WireGuard (Remote Access)
- WireGuard runs as a container (`wg-easy` or `linuxserver/wireguard`).
- Remote clients connect to the server's public IP on port 51820.
- WireGuard assigns clients an IP in `10.8.0.0/24`.
- Pi-hole is set as the DNS server pushed to WireGuard clients → ad blocking + local DNS resolution works remotely too.
- The WireGuard subnet is treated as equivalent to LAN for DNS purposes — clients see the same `*.home.example.com` domains resolving to internal IPs.

---

## 3. DNS Strategy

### Local Resolution (Pi-hole)
Pi-hole handles all DNS for LAN clients (set as DNS on the router).

Local DNS records added in Pi-hole's custom DNS:
```
192.168.1.10   home.example.com
192.168.1.10   nextcloud.home.example.com
192.168.1.10   vault.home.example.com
192.168.1.10   media.home.example.com
# ... etc
```

All local names resolve to the server's LAN IP → connection stays entirely on LAN (no hairpin NAT needed).

### Public Resolution
Public DNS (Cloudflare / your registrar) has A records pointing `*.home.example.com` to the server's public IP (used by WAN clients and Let's Encrypt ACME validation).

### Split-Horizon Summary
| Client location | DNS server | Resolves `nextcloud.home.example.com` to |
|-----------------|------------|------------------------------------------|
| LAN | Pi-hole | `192.168.1.10` (server LAN IP) |
| WireGuard | Pi-hole (via VPN) | `192.168.1.10` |
| External | Cloudflare | `<public IP>` → router → server |

No client reconfiguration needed when switching networks.

### Option: Wildcard via Caddy internal CA (alternative)
For a pure-LAN setup with no internet exposure, Caddy can act as a local CA and issue wildcard certs for `*.home.lan`. Devices need to trust the Caddy root CA once. This removes the need for a public domain but complicates mobile access. **Decision: use public domain + Let's Encrypt for simplicity.**

---

## 4. Reverse Proxy Decision

### Candidates
| Proxy | Pros | Cons |
|-------|------|-------|
| **Caddy** | Dead-simple config, automatic HTTPS, native Sablier plugin | Less battle-tested for complex setups |
| **SWAG** (linuxserver) | Nginx power, huge community, pre-made configs for common apps | More verbose config, manual cert renewal |
| **Traefik** | Docker-native label routing | Complex, heavy, overkill for single node |

### Decision: **Caddy as primary, SWAG configs as reference**
- Caddy's config is readable and version-controllable.
- The [Sablier Caddy plugin](https://github.com/acouvreur/sablier) integrates natively — on-demand wakeup is a few lines in the Caddyfile.
- SWAG proxy-conf snippets remain useful as reference for headers/upstream config.
- If Caddy proves limiting, SWAG can replace it with minimal DNS/cert changes.

### Caddyfile pattern
```
nextcloud.home.example.com {
    # on-demand via Sablier
    sablier http://sablier:10000 {
        names nextcloud
        session_duration 30m
        dynamic {
            display_name "Nextcloud"
            theme light
        }
    }
    reverse_proxy nextcloud:80
    tls {
        dns cloudflare {env.CF_API_TOKEN}
    }
}
```

### TLS
- DNS challenge via Cloudflare (avoids needing port 80 open for ACME).
- Wildcard cert for `*.home.example.com` — one cert covers all services.
- Cert stored in a named Docker volume, survives container restarts.

---

## 5. On-Demand Services with Sablier

[Sablier](https://github.com/acouvreur/sablier) monitors incoming requests to the reverse proxy. When a request arrives for a stopped container, Sablier starts it and shows a loading page. After an idle timeout it stops the container again.

### Services classification

| Service | Always-on? | Reason |
|---------|-----------|--------|
| Pi-hole | ✅ Yes | DNS must never drop |
| Caddy | ✅ Yes | Reverse proxy must always accept requests |
| Nextcloud DB + Redis | ✅ Yes | Nextcloud's background jobs need DB available |
| Nextcloud (app) | ✅ Yes | Central hub; fast-start expected |
| Vaultwarden | ✅ Yes | Password manager must be instant |
| Samba | ✅ Yes | File shares expected immediately |
| WireGuard | ✅ Yes | VPN access must always work |
| **Jellyfin** | ⏸ On-demand | Heaviest service; start on first request |
| **Immich** | ⏸ On-demand | ML workers are CPU-intensive |
| **Gitea** | ⏸ On-demand | Dev tool, not needed 24/7 |
| **Homepage** | ⏸ On-demand | Dashboard only needed when actively checking |
| **Uptime Kuma** | ✅ Yes | Monitoring should run continuously |

### Sablier idle timeout recommendations
- Jellyfin: 30 min (media sessions can be long)
- Immich: 20 min (allow ML processing to finish)
- Gitea: 15 min

---

## 6. Container Layout & Docker Networks

### Docker Networks

```
proxy-net       bridge  — Caddy + all HTTP services (Caddy is the only ingress)
internal-net    bridge  — DB, Redis, Nextcloud inter-service comms (no host port exposure)
lan-net         bridge  — Pi-hole (or host mode for DNS port 53 access)
```

No container other than Caddy is on both `proxy-net` and exposed to the host. Samba uses `network_mode: host` (necessary for NetBIOS/SMB broadcast) but is firewall-restricted to the LAN interface via iptables/nftables rules applied at startup.

### Compose file strategy
Split into focused Compose files, linked via a shared external network:

```
docker/
├── core/
│   └── compose.yml        # Caddy, Sablier, WireGuard, Uptime Kuma
├── pihole/
│   └── compose.yml        # Pi-hole (standalone DNS)
├── samba/
│   └── compose.yml        # Samba (host network, LAN only)
├── nextcloud/
│   └── compose.yml        # Nextcloud app + MariaDB + Redis
├── privacy/
│   └── compose.yml        # Vaultwarden, Immich
└── media/
    └── compose.yml        # Jellyfin (on-demand)
```

A root `compose.yml` (or a `Makefile`) can bring up all stacks. A `scripts/start-core.sh` brings up only the always-on services — useful for a gaming session where only LAN backbone is needed.

---

## 7. Service Catalogue

### Core (always-on)

#### Pi-hole
- Image: `pihole/pihole`
- Ports: 53 (DNS, LAN only), 80 (admin UI, LAN only)
- Volumes: pihole config, dnsmasq config
- Custom DNS entries managed via `pihole/config/custom.list`
- **Not** behind Caddy — admin UI accessed via `http://192.168.1.10:8053` (mapped internal only)

#### Caddy
- Image: custom build with `caddy-dns/cloudflare` and `sablier` plugins
- Ports: 80, 443 (both internet-exposed)
- Volumes: Caddyfile, certs volume, Caddy data volume

#### Sablier
- Image: `acouvreur/sablier`
- Exposes port 10000 to `proxy-net` only
- Configured with Docker provider (manages containers by name)

#### WireGuard
- Image: `linuxserver/wireguard` or `wg-easy/wg-easy`
- Port: 51820/UDP (internet-exposed)
- Pushes Pi-hole LAN IP as DNS to clients

#### Vaultwarden
- Image: `vaultwarden/server`
- Always-on (password manager must never be unavailable)
- Reverse proxy: `vault.home.example.com`

### LAN Backbone

#### Samba
- Image: `dperson/samba` or `servercontainers/samba`
- `network_mode: host` — required for SMB broadcast/discovery
- Firewall rule ensures ports 445/139 not reachable from WAN
- Shares: `/data/shares` mapped to named Docker volume or bind mount

### On-Demand

#### Jellyfin
- Image: `jellyfin/jellyfin`
- Hardware transcoding: GPU passthrough (Intel QSV / Nvidia) if available
- Sablier idle timeout: 30 min
- Reverse proxy: `media.home.example.com`

#### Immich
- Images: `ghcr.io/immich-app/immich-server`, `immich-machine-learning`
- On-demand (ML worker is the heavy part)
- Reverse proxy: `photos.home.example.com`

#### Gitea
- Image: `gitea/gitea`
- On-demand
- Reverse proxy: `git.home.example.com`

---

## 8. Nextcloud Deep Dive

### Deployment choice: Standard vs AIO
| Option | Pros | Cons |
|--------|------|-------|
| **Nextcloud AIO** | One container manages everything, auto-updates | Less control, harder to customise networking |
| **Standard stack** | Full control of DB, Redis, reverse proxy integration | More compose config |

**Decision: Standard stack** — gives us control over Sablier integration, network placement, and the ability to tune MariaDB/Redis independently.

### Stack components
- `nextcloud:apache` — main app (or `nextcloud:fpm` + separate Nginx if performance needed)
- `mariadb:11` — database
- `redis:alpine` — session cache + file locking
- `nextcloud-cron` — separate container running `cron.php` on a schedule (background jobs)

### Key Nextcloud config (`config.php` overrides via environment)
```php
'trusted_domains' => ['nextcloud.home.example.com'],
'trusted_proxies' => ['caddy'],   // Caddy container name / subnet
'overwrite.cli.url' => 'https://nextcloud.home.example.com',
'overwriteprotocol' => 'https',
'redis' => [...],
'memcache.local' => '\OC\Memcache\Redis',
'memcache.distributed' => '\OC\Memcache\Redis',
'memcache.locking' => '\OC\Memcache\Redis',
```

### Modules / Apps plan
| App | Replaces |
|-----|----------|
| Nextcloud Files | Google Drive / Dropbox |
| Nextcloud Photos | Google Photos (basic) |
| Nextcloud Contacts | Google Contacts |
| Nextcloud Calendar | Google Calendar |
| Nextcloud Talk | WhatsApp / Zoom (basic) |
| Nextcloud Notes | Google Keep |
| Nextcloud Office (Collabora) | Google Docs |
| Nextcloud Mail | Gmail client |

Collabora Online (Nextcloud Office) is the heaviest optional module — candidate for Sablier on-demand if needed.

---

## 9. Storage Strategy

### Volume layout (bind mounts preferred for portability)
```
/srv/homelab/
├── nextcloud/
│   ├── data/          # User files (large, back this up)
│   ├── config/
│   └── db/
├── jellyfin/
│   ├── config/
│   └── media/         # Symlink or bind to NAS/external drive
├── immich/
│   └── upload/
├── vaultwarden/
│   └── data/
├── pihole/
│   ├── config/
│   └── dnsmasq/
└── samba/
    └── shares/
```

All data lives under `/srv/homelab` — one directory to back up or snapshot.

### Backup strategy (to be detailed)
- Nextcloud: `occ maintenance:mode --on` → rsync/rclone data dir → off.
- DB: `mysqldump` daily to `/srv/homelab/backups/`.
- Vaultwarden: copy `/data/db.sqlite3` daily.
- Rclone to an encrypted remote (Backblaze B2 / local NAS drive) weekly.

---

## 10. Security Model

### Exposure matrix
| Service | LAN | WireGuard | Internet |
|---------|-----|-----------|----------|
| Pi-hole admin | ✅ | ✅ (via VPN DNS) | ❌ |
| Samba | ✅ | ❌ | ❌ |
| Nextcloud | ✅ | ✅ | ✅ |
| Vaultwarden | ✅ | ✅ | ✅ |
| Jellyfin | ✅ | ✅ | ✅ |
| Gitea | ✅ | ✅ | ✅ (optional) |
| Caddy admin API | ❌ | ❌ | ❌ |
| Docker socket | ❌ | ❌ | ❌ |

### Hardening checklist (ongoing)
- [ ] Caddy rate limiting on all public endpoints
- [ ] Fail2ban (or Crowdsec) for brute force protection
- [ ] Nextcloud 2FA enforced for admin account
- [ ] Vaultwarden admin panel disabled after setup (`DISABLE_ADMIN_TOKEN=true`)
- [ ] Docker socket mounted read-only via socket proxy (haproxy/tecnativasocat) — Sablier uses it
- [ ] No `privileged: true` containers (except WireGuard which needs `NET_ADMIN`)
- [ ] Automated security updates for base OS
- [ ] Firewall (ufw / nftables) default-deny, explicit allow only

---

## 11. Hardware Profiles

### Profile A — Steam Machine / Mini PC (x86_64, 8-16 GB RAM)
- Full stack with all on-demand services.
- Sablier is critical — stop Jellyfin/Immich before gaming.
- Consider a `scripts/gaming-mode.sh` that stops all on-demand containers.
- Intel QSV or Nvidia GPU passthrough for Jellyfin transcoding.

### Profile B — Raspberry Pi 5 (ARM64, 8 GB)
- Full stack possible but careful about Immich ML (heavy).
- Jellyfin: software transcode only (or skip transcoding, direct play).
- Consider `arm64` image variants (all chosen images publish arm64).
- Use SSD via USB 3 — SD card is too slow for Nextcloud database.

### Profile C — Raspberry Pi 4 (ARM64, 4 GB)
- Run core + Nextcloud + Vaultwarden + Pi-hole.
- Skip Immich ML worker (or run on-demand with generous timeout).
- Jellyfin optional — direct play only, no transcode.

### Profile D — NAS (Synology DSM / TrueNAS SCALE)
- Replace Samba with native NAS share (SMB/NFS built-in, better performance).
- Pi-hole can run in NAS Docker or on a separate Pi.
- All other services run in NAS Docker/Portainer.

---

## 12. Phase Roadmap

### Phase 0 — Foundation ✏️ (current)
- [x] README and plan
- [ ] Repo structure scaffolding
- [ ] `.env.example` with all required variables documented
- [ ] Shared Docker network definitions

### Phase 1 — LAN Backbone
- [ ] Pi-hole compose + custom DNS config
- [ ] Samba compose with sensible share defaults
- [ ] Validate: DNS works, shares visible on LAN

### Phase 2 — Reverse Proxy + TLS
- [ ] Build custom Caddy image (cloudflare-dns + sablier plugins)
- [ ] Wildcard TLS cert via DNS challenge
- [ ] Caddyfile skeleton with placeholder services
- [ ] WireGuard compose + client config generation

### Phase 3 — Nextcloud
- [ ] Nextcloud + MariaDB + Redis compose
- [ ] Trusted proxy headers config
- [ ] Cron container for background jobs
- [ ] Core Nextcloud apps installed and configured
- [ ] Collabora Online (on-demand candidate)

### Phase 4 — Privacy Services
- [ ] Vaultwarden compose + Caddy route
- [ ] Immich compose (on-demand)

### Phase 5 — Media & Dev
- [ ] Jellyfin compose (on-demand) + GPU passthrough option
- [ ] Gitea compose (on-demand)
- [ ] Homepage dashboard compose

### Phase 6 — Hardening & Maintenance
- [ ] Crowdsec or Fail2ban integration
- [ ] Backup scripts (DB dump, data rsync, rclone remote)
- [ ] Auto-update script with rollback
- [ ] gaming-mode.sh convenience script (stop on-demand services)

---

## 13. Open Questions

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | Nextcloud AIO vs standard stack? | AIO / Standard | **Standard** — more control |
| 2 | Caddy vs SWAG? | Caddy / SWAG | **Caddy** — simpler, native Sablier |
| 3 | WireGuard implementation? | wg-easy / linuxserver | TBD — wg-easy has nicer UI |
| 4 | Immich on Pi 4 — run ML worker? | Yes / No / On-demand | TBD — profile-dependent |
| 5 | Collabora always-on or on-demand? | Always / On-demand | TBD — measure RAM usage first |
| 6 | Domain registrar for wildcard cert? | Cloudflare / other | **Cloudflare** preferred (DNS API well-supported) |
| 7 | Gaming mode — manual script or systemd trigger? | Script / systemd / steam hook | TBD |
| 8 | Backup destination — local only or remote too? | Local / Rclone remote | TBD — at minimum local NAS/USB |

---

*Last updated: Phase 0 — initial plan draft.*
