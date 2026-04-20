# Copilot Instructions — HomeLab

This repository contains two things:

1. **A working Docker Compose HomeLab stack** — reference configs for all four layers (LAN → WAN → Domain → Services), decision records (ADRs), and developer guides.
2. **A TypeScript config generator** (`generator/`) — a CLI tool that generates ready-to-deploy Docker Compose + `.env` from user inputs. Currently in development; the layer generators are stubs.

Tasks are tracked with [Backlog.md](https://github.com/MrLesk/Backlog.md) in `backlog/`. Run `backlog board` to see the Kanban.

---

## Repository Layout

```
backlog/                          # Backlog.md task files (markdown-native task board)
  tasks/                          # Active tasks (BACK-N - title.md)
  completed/                      # Done tasks
  config.yml                      # Backlog.md project config
decisions/                        # Per-capability decision records (ADRs)
  device-support-matrix.md
  platform-choice.md
  layer_0_lan.md                  # Layer 0 index
  layer_1_wan.md                  # Layer 1 index
  layer_2_domain.md               # Layer 2 index
  layer_3_services.md             # Layer 3 index
  layer_0_lan/                    # One folder per capability
    file-sharing/
    dns/
    monitoring/
    database/
  layer_1_wan/
    vpn/
    firewall/
  layer_2_domain/
    ddns/
    reverse-proxy/
    sablier/
  layer_3_services/
    nextcloud/
    database/
docs/
  strategy.md                     # Cross-cutting principles
  dev-setup-windows.md            # WSL2 + Docker developer setup guide
examples/                         # Working reference Docker Compose configs
  lan/                            # Layer 0 — LAN (✅ tested)
  wan/                            # Layer 1 — WAN + VPN (✅ tested)
  domain/                         # Layer 2 — Domain + Caddy (✅ tested)
  services/                       # Layer 3 — Nextcloud + PostgreSQL (✅ tested)
generator/                        # TypeScript CLI config generator
  src/
    index.ts                      # CLI entry point (Commander)
    schema.ts                     # Zod input schema + GeneratorInput type
    generate.ts                   # Orchestrator stub
  package.json
  tsconfig.json
  README.md
README.md
```

---

## Layer Model

All four layers are **implemented and tested**. Each layer is a strict superset of the previous.

| Layer | Name | Status | Scope |
|-------|------|--------|-------|
| **0** | LAN | ✅ Done | DNS filtering (AdGuard), file sharing (Samba), monitoring (Gatus) |
| **1** | WAN | ✅ Done | WireGuard VPN + CrowdSec firewall + split-horizon DNS |
| **2** | Domain | ✅ Done | dynDNS, Caddy reverse proxy + TLS, Sablier on-demand startup |
| **3** | Services | ✅ Done | Nextcloud FPM (files, contacts, calendar, Memories) + PostgreSQL |

---

## Project Principles

Applied in order. Earlier principles win when they conflict.

### 1. Lighter is better — fewer containers

Prefer an image that bundles multiple features over running multiple containers. Caddy `php_fastcgi` is used instead of a separate nginx sidecar for Nextcloud FPM. Prefer smaller images and lower RAM footprint.

### 2. File config over wizard / UI config

Full configuration lives in version-controlled files (YAML, TOML, env vars). Services that require a browser wizard for every fresh deployment are deprioritised.

### 3. Evaluate before committing

No service is added until:
1. Confirmed to serve a real use case
2. Verified as a working Docker image on target architectures (actually pulled)
3. Tested locally with sane defaults
4. Documented with a passing `testing.md`

Speculative additions go in `horizon.md` files, not in the stack.

### 4. Image verification is mandatory

Before referencing any Docker image, confirm it exists by pulling it or checking the registry. Do not document an unverified image path.

### 5. ARM64 required

Every selected image must support ARM64 (Raspberry Pi target). Verify from the manifest.

### 6. FOSS first

All services must be FOSS-licensed. Exception: Valve/Steam is a first-class citizen because the Steam Machine is a core hardware target.

---

## How Decision Folders Work

Every capability has a decision **folder** in `decisions/layer_X/<capability>/`:

| File | Contents |
|------|----------|
| `README.md` | Index: role, status (🔍 / ✅), links to sub-files, constraints |
| `candidates.md` | Candidate comparison — "Pulled & verified" must be ✅ before selecting |
| `networking.md` | Docker networking modes and trade-offs |
| `configuration.md` | Config design: files, env vars, auth model |
| `testing.md` | Verification checklist and results — **the gate for finalising status** |
| `horizon.md` | Out-of-scope ideas for future consideration |

**`testing.md` is the gate.** Status stays 🔍 until it contains passing results.

---

## Generator (`generator/`)

The generator is a TypeScript CLI tool that accepts user inputs and produces ready-to-deploy Docker Compose + `.env` configs. It is the **next major milestone** of the project.

Key files:
- `src/schema.ts` — Zod schema for all generator inputs (`GeneratorInput` type)
- `src/index.ts` — Commander CLI; validates input, calls `generate()`
- `src/generate.ts` — Orchestrator; calls per-layer generators (layer generators are stubs)

Development:
```bash
cd generator
npm install
npm run dev -- generate --help
npm run typecheck
```

Tasks for the generator are in `backlog/tasks/` (BACK-1 through BACK-5). Run `backlog board` to see them.

---

## Critical Rules

### No Immich — ever

Immich has been permanently removed from this project. Use Nextcloud Memories for photo management.

### No Redis for now

Redis/Valkey is deferred — file locking via PostgreSQL is sufficient for the current scope.

### Database: PostgreSQL only

Use `postgres:17` (plain). No pgvector unless a specific service requires it. One shared instance, one database + user per service.

---

## Examples Layout

Each `examples/` folder is a self-contained, runnable stack:
- `docker-compose.yml` — production target (real Linux host, `network_mode: host`)
- `docker-compose.wsl.yml` — WSL2 override (alternate ports, host-mode workarounds)
- `.env.example` — all variables with defaults; copy to `.env` before running
- `config/` — pre-baked config files mounted read-only
- `data/` — runtime state, excluded from git

---

## WSL2 Development Notes

See `docs/dev-setup-windows.md` for the full guide. Key constraints:
- Port 445 owned by Windows `LanmanServer` — Samba binds inside container but Windows blocks it from outside
- Port 53 owned by Windows DNS stub — AdGuard DNS conflicts; bind to specific eth0 IP instead
- Port 8080 owned by `wslrelay.exe` — cannot be killed; use port 8082 for Gatus in WSL
- NTFS bind mounts (`/mnt/d/...`) cause I/O errors inside containers — use WSL-native ext4 paths
- Avahi/wsdd2 multicast doesn't propagate through WSL2 NAT — discovery only works on real hardware

Use `docker-compose -f docker-compose.yml -f docker-compose.wsl.yml up -d` for WSL2 testing.

---

## Hardware Targets

| Target | Notes |
|--------|-------|
| Steam Machine / x86_64 PC | Full feature set; Sablier at Layer 2 is critical for gaming performance |
| Raspberry Pi 4/5 (ARM64) | ARM64 image required for every service |
| NAS (Synology / TrueNAS) | Docker-compatible; native NAS shares may coexist with containerised services |

---

## Session Continuity

Decisions and findings must be written to project files as they happen — not held only in chat. Record outcomes in decision files, open questions in `Open Decisions` sections. Use `backlog task create` to track new work items rather than notes in chat.

