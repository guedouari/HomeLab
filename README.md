# HomeLab

> A self-hosted home server stack designed to run out of the box on a Steam Machine, Raspberry Pi, NAS, or any low-power x86/ARM device.

---

## What is this?

HomeLab turns a small home server into a private, always-available infrastructure hub. It prioritises:

- **Zero-friction LAN life** — DNS filtering, local DNS, and file sharing work the moment the stack boots.
- **Data sovereignty** — your files, calendars, contacts, and media stay on hardware you own.
- **On-demand services** — resource-hungry services (media server, game library, etc.) start only when needed, freeing the host for gaming or other tasks.
- **Unified access** — the same domain names and URLs work whether you're on the home network or connecting remotely over VPN.
- **Network segregation** — internal-only services (file sharing, DNS filtering) are never exposed to the public internet.

---

## Core Pillars

### 1. LAN Backbone
| Capability | Role |
|------------|------|
| **DNS filtering** | Network-wide ad blocking and local DNS records |
| **File sharing** | LAN file shares (NAS-like access from any OS) |

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

| Layer | Status | Choice |
|-------|--------|--------|
| Containers | ✅ Final | **Docker + Compose** — portable, well-documented, broad hardware support |
| Images | ✅ Final | **linuxserver.io** — consistent, community-maintained, ARM64 + x86_64 |
| Reverse proxy | Proposed | SWAG (linuxserver/swag) — automatic TLS, linuxserver ecosystem |
| On-demand startup | Proposed | Sablier — starts containers on request, stops them after idle |
| DNS filtering | Proposed | Pi-hole — network-wide ad blocking and local DNS |
| VPN | Proposed | WireGuard — WAN layer secure tunnel |
| Core app | Proposed | Nextcloud — self-hosted productivity suite |

---

## Key Design Decisions

### On-Demand Services
Non-essential services are started only when a request arrives and stopped after an idle window. This ensures a Steam Machine or resource-limited Pi is not fighting background services during gaming or intensive tasks.

### Single-Domain Access (LAN + WAN)
Local DNS overrides resolve `*.home.yourdomain.com` to the internal server IP on the LAN. The same domains resolve to the public IP from outside. The reverse proxy terminates TLS and routes identically in both cases — no client configuration changes needed when leaving home. The VPN (WAN layer) extends this further by letting remote devices behave as if they are on the LAN.

### Network Segregation
- **LAN-only services** (file sharing, DNS filtering admin) bind only to the internal network interface and are never routed through the public-facing reverse proxy.
- **External-reachable services** (Nextcloud, Vaultwarden, Jellyfin, etc.) are behind the reverse proxy with strict rate limiting and optional 2FA.
- Docker networks enforce this at the container level — LAN services live on an isolated bridge with no internet routing.

---

## Hardware Targets

| Device | Notes |
|--------|-------|
| **Steam Machine / Mini PC / General x86_64** | Full feature set; Sablier on-demand critical to preserve gaming performance |
| **Raspberry Pi 4/5** (ARM64) | Full feature set on Pi 5; Pi 4 may need lighter alternatives for transcoding |
| **NAS (Synology / TrueNAS)** | Docker-compatible NAS can run the full stack; Samba may be replaced by native NAS shares |

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
