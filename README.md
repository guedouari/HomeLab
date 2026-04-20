# HomeLab

> A self-hosted home server stack designed to run out of the box on a Steam Machine, Raspberry Pi, NAS, or any low-power x86/ARM device.

---

## What is this?

HomeLab turns a small home server into a private, always-available infrastructure hub. It prioritises:

- **Zero-friction LAN life** — DNS filtering, local DNS, and file sharing work the moment the stack boots.
- **Data sovereignty** — your files, calendars, contacts, and media stay on hardware you own.
- **On-demand services** — resource-hungry services start only when needed, freeing the host for gaming or other tasks.
- **Unified access** — the same domain names work on the home network and over VPN.
- **Network segregation** — internal-only services are never exposed to the public internet.

---

## Layer Model

The project is built in strict layers — each is a functional product on its own, and a strict superset of the previous.

| Layer | Name | Status | Scope |
|-------|------|--------|-------|
| **0** | LAN | ✅ Done | DNS filtering, file sharing, lightweight monitoring |
| **1** | WAN | ✅ Done | WireGuard VPN + firewall (CrowdSec) + split-horizon DNS |
| **2** | Domain | ✅ Done | Public domain, dynDNS, reverse proxy (Caddy), on-demand startup (Sablier) |
| **3** | Services | ✅ Done | Nextcloud (files, contacts, calendar, Memories) + PostgreSQL |

---

## Project Structure

```
HomeLab/
├── backlog/            # Backlog.md task files — project board
├── decisions/          # Per-capability decision records (ADRs)
│   ├── layer_0_lan/
│   ├── layer_1_wan/
│   ├── layer_2_domain/
│   └── layer_3_services/
├── docs/               # Strategy and developer guides
│   ├── strategy.md
│   └── dev-setup-windows.md
├── examples/           # Working reference Docker Compose configs
│   ├── lan/            # Layer 0
│   ├── wan/            # Layer 1
│   ├── domain/         # Layer 2
│   └── services/       # Layer 3
└── generator/          # TypeScript config generator (in development)
```

---

## Getting Started

1. Clone the repo to your server.
2. Pick your layer (`examples/lan`, `examples/wan`, `examples/domain`, or `examples/services`).
3. Copy `.env.example` to `.env` and fill in your values.
4. Run `docker compose up -d`.
5. Follow the layer's `README.md` for pre-flight steps.

See [`docs/dev-setup-windows.md`](docs/dev-setup-windows.md) for the WSL2 development setup.

---

## Hardware Targets

| Device | Notes |
|--------|-------|
| **Steam Machine / Mini PC / x86_64** | Full feature set; Sablier critical for gaming performance |
| **Raspberry Pi 4/5** (ARM64) | Full feature set; Pi 4 may need lighter alternatives for transcoding |
| **NAS (Synology / TrueNAS)** | Docker-compatible NAS runs the full stack |

---

## Roadmap

All tasks are tracked in [`backlog/`](backlog/) using [Backlog.md](https://github.com/MrLesk/Backlog.md).

The next milestone is the **TypeScript configuration generator** — a CLI tool that accepts hardware target + desired services and produces a ready-to-deploy Docker Compose + `.env` tailored to that setup. See [`generator/`](generator/).

