# HomeLab

> A self-hosted home server stack designed to run out of the box on a Steam Machine, Raspberry Pi, NAS, or any low-power x86/ARM device.

---

## What is this?

HomeLab turns a small home server into a private, always-available infrastructure hub. It prioritises:

- **Zero-friction LAN life** — ad blocking, local DNS, and file sharing work the moment the stack boots.
- **Data sovereignty** — your files, calendars, contacts, and media stay on hardware you own.
- **On-demand services** — resource-hungry services (media server, game library, etc.) start only when needed, freeing the host for gaming or other tasks.
- **Unified access** — the same domain names and URLs work whether you're on the home network or connecting remotely over WireGuard/VPN.
- **Network segregation** — internal-only services (Samba, Pi-hole admin) are never exposed to the public internet.

---

## Core Pillars

### 1. LAN Backbone
| Service | Role |
|---------|------|
| **Pi-hole** | Network-wide DNS ad blocking, local DNS records |
| **Samba** | LAN file shares (NAS-like access from any OS) |

### 2. Data Privacy
| Service | Role |
|---------|------|
| **Nextcloud** | Central hub — files, photos, calendars, contacts, notes, document editing |
| **Nextcloud Talk** | Encrypted messaging & video calls (replaces WhatsApp / Zoom) |
| **Nextcloud Mail** | Webmail client (optional) |
| **Vaultwarden** | Self-hosted Bitwarden-compatible password manager |

### 3. Extensible Services (opt-in)
| Service | Role |
|---------|------|
| **Jellyfin** | Media server — movies, music, TV (replaces Plex / Netflix) |
| **Immich** | Photo & video backup (replaces Google Photos) |
| **Gitea** | Self-hosted Git (replaces GitHub) |
| **Homepage** | Unified dashboard for all services |
| **Uptime Kuma** | Internal health monitoring |

---

## Technology Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Containers | **Docker + Compose** | Portable, well-documented, broad hardware support |
| Reverse proxy | **SWAG** (Nginx + Certbot) or **Caddy** | Automatic TLS, flexible routing |
| On-demand startup | **Sablier** | Starts containers only when a request arrives; stops them after idle |
| DNS / Ad block | **Pi-hole** | Runs as a system service or privileged container |
| Core app | **Nextcloud (AIO or standard)** | Best-in-class self-hosted productivity suite |

---

## Key Design Decisions

### On-Demand Services
Services flagged as "on-demand" are managed by **Sablier**. When no request has arrived for a configurable idle window, Sablier stops the container. The next HTTP request wakes it back up (with a loading screen while it starts). This ensures a Steam Machine or resource-limited Pi is not fighting background services during gaming or intensive tasks.

### Single-Domain Access (LAN + WAN)
Pi-hole's local DNS overrides resolve `*.home.yourdomain.com` to the internal server IP on the LAN. The same domains resolve to the WireGuard/public IP from outside. The reverse proxy terminates TLS and routes identically in both cases — no client configuration changes needed when leaving home.

### Network Segregation
- **LAN-only services** (Pi-hole web UI, Samba) bind only to the internal network interface and are never routed through the public-facing reverse proxy.
- **External-reachable services** (Nextcloud, Vaultwarden, Jellyfin, etc.) are behind SWAG/Caddy with strict rate limiting and optional 2FA.
- Docker networks enforce this at the container level — LAN services live on an isolated bridge with no internet routing.

---

## Hardware Targets

| Device | Notes |
|--------|-------|
| **Steam Machine / Mini PC** (x86_64) | Full feature set; Sablier on-demand critical to preserve gaming performance |
| **Raspberry Pi 4/5** (ARM64) | Full feature set on Pi 5; Pi 4 may need lighter alternatives for transcoding |
| **NAS (Synology / TrueNAS)** | Docker-compatible NAS can run the full stack; Samba may be replaced by native NAS shares |
| **Generic VPS** | WAN-only mode — no Samba/Pi-hole, all other services supported |

---

## Project Structure (planned)

```
HomeLab/
├── docker/
│   ├── core/           # Pi-hole, SWAG/Caddy, Sablier
│   ├── nextcloud/      # Nextcloud + DB + Redis
│   ├── privacy/        # Vaultwarden, Immich
│   ├── media/          # Jellyfin (on-demand)
│   └── dev/            # Gitea, Homepage, Uptime Kuma
├── config/
│   ├── caddy/          # Caddyfile templates
│   ├── swag/           # NGINX site configs
│   └── pihole/         # DNS records, adlists
├── scripts/
│   ├── install.sh      # Bootstrap script
│   └── update.sh       # Pull & restart stack
├── plan.md             # Detailed architecture & decisions
└── README.md
```

---

## Getting Started

> Full setup instructions will be added as each phase of [plan.md](plan.md) is implemented.

1. Clone the repo to your server.
2. Copy `.env.example` to `.env` and fill in your domain, credentials, and network settings.
3. Run `scripts/install.sh` to bootstrap Docker, create networks, and start the core stack.
4. Point Pi-hole as the DNS server on your router (or per-device).
5. Access services at `https://*.home.yourdomain.com`.

---

## Status

Early planning phase — see [plan.md](plan.md) for the detailed roadmap.
