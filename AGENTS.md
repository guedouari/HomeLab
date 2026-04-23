# Copilot Instructions — HomeLab

This repository contains two things:

1. **A working Docker Compose HomeLab stack** — reference configs for all four layers (LAN → WAN → Domain → Services), decision records (ADRs), and developer guides.
2. **A TypeScript config generator** (`generator/`) — a CLI tool that generates ready-to-deploy Docker Compose + `.env` from user inputs. Currently in development; the layer generators are stubs.

Tasks are tracked with [Backlog.md](https://github.com/MrLesk/Backlog.md) in `backlog/`. Run `backlog board` to see the Kanban.

---

## Repository Layout

```
src/                              # TypeScript generator (project root — primary focus)
  index.ts                        # CLI entry point (Commander)
  schema.ts                       # Zod input schema + GeneratorInput type
  generate.ts                     # Orchestrator stub — layer generators go here
backlog/                          # Backlog.md — task board, docs, and decision records
  config.yml                      # Backlog.md project config (task prefix: BACK)
  tasks/                          # Active tasks (BACK-N - title.md)
  drafts/                         # Draft tasks + proposed decisions not yet ready to implement
  completed/                      # Done tasks
  docs/                           # Product-level docs (Backlog.md scans here)
    strategy.md                   # Cross-cutting principles (id: doc-1)
    roadmap.md                    # Implementation roadmap / plan (id: doc-2)
  decisions/                      # Formal ADRs ONLY — accepted decision-N - title.md files
docs/                             # Developer docs (NOT scanned by Backlog.md)
  dev-setup-windows.md            # WSL2 + Docker developer setup guide
  research/                       # Per-capability research notes (nested, read-only reference)
examples/                         # Working reference Docker Compose configs
  lan/                            # Layer 0 — LAN (✅ tested)
  wan/                            # Layer 1 — WAN + VPN (✅ tested)
  domain/                         # Layer 2 — Domain (reverse proxy + TLS)
  services/                       # Layer 3 — Services (Nextcloud reference stack, ✅ tested)
package.json                      # Generator dependencies
tsconfig.json                     # TypeScript config (CommonJS, strict)
README.md
```

---

## Layer Model

All four layers are **implemented and tested**. Each layer is a strict superset of the previous.

| Layer | Name | Status | Scope |
|-------|------|--------|-------|
| **0** | LAN | ✅ Done | DNS filtering, file sharing, monitoring |
| **1** | WAN | ✅ Done | VPN + firewall + split-horizon DNS |
| **2** | Domain | ✅ Done | dynDNS, reverse proxy + TLS, on-demand container startup |
| **3** | Services | ✅ Done | User-selected services (reference: file sync + contacts + calendar + photos) |

---

## Project Principles

Applied in order. Earlier principles win when they conflict.

### 1. Lighter is better — fewer containers

Prefer an image that bundles multiple features over running multiple containers. Prefer smaller images and lower RAM footprint.

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

## How Decisions Are Organised

### ADR rules (strict)

- **`backlog/decisions/`** contains **only** formal, accepted Architecture Decision Records in `decision-N - title.md` format with YAML frontmatter (`id`, `title`, `date`, `status: Accepted`). Nothing else goes here.
- **`backlog/drafts/`** is where decisions or tasks that are **not yet ready to implement** live. A proposed/draft decision that hasn't been formally accepted, or a future task with unresolved dependencies, belongs here — not in `backlog/decisions/` or `backlog/tasks/`.

Deep research notes (candidate comparisons, networking analysis, testing results) live in `docs/research/layer_X_*/` — they are reference material only, not task items.

**Current decisions (all Accepted):**
- decision-1: Docker + Compose (platform)
- decision-2: Generator Architecture — code-first TypeScript, isomorphic core
- decision-3: Generator Testing Strategy — golden-file tests
- decision-4: Layer structure — four additive capability layers
- decision-5: Device support matrix

---

## Generator (`src/`)

The generator is a TypeScript CLI at the **project root** (`src/`, `package.json`, `tsconfig.json`). It is the primary active development focus.

Key files:
- `src/schema.ts` — Zod schema for all generator inputs (`GeneratorInput` type)
- `src/index.ts` — Commander CLI; validates input, calls `generate()`
- `src/generate.ts` — Orchestrator; calls per-layer generators (stubs)

Development:
```bash
npm install
npm run dev -- generate --help
npm run typecheck
```

Tasks for the generator are in `backlog/tasks/` (BACK-1 through BACK-5). Run `backlog board` to see them.

---

## Critical Rules

### No Immich — ever

Immich has been permanently excluded from this project. The photo management solution will be evaluated when the service layer is built.

### No caching layer for now

Redis/Valkey is deferred — a database backend is sufficient for file locking at current scope.

### Service solutions are not final

No service-specific solution (DNS filter, VPN, reverse proxy, file sync, etc.) is decided until its dedicated implementation task. Only the container platform (Docker + Compose) is settled. New tasks must not assume or hard-code a specific image choice.

---

## Examples Layout

Each `examples/` folder is a self-contained, runnable stack:
- `docker-compose.yml` — production target (real Linux host, `network_mode: host`)
- `docker-compose.wsl.yml` — WSL2 override (alternate ports, host-mode workarounds)
- `.env.example` — all variables with defaults; copy to `.env` before running
- `config/` — pre-baked config files mounted read-only
- `data/` — runtime state, excluded from git

---

## WSL2 / Windows Deployment Notes

Windows machines (WSL2 + Docker Engine or Podman Desktop) are **first-class deployment targets**. See `docs/setup/windows.md` for the overview and `docs/setup/windows-wsl.md` / `docs/setup/windows-podman.md` for the specific guides.

Key constraints that apply to all Windows deployments:
- Port 445 owned by Windows `LanmanServer` — SMB file-sharing containers cannot bind externally in WSL
- Port 53 conflict — DNS filtering containers must bind to the VM's specific eth0 IP, not `0.0.0.0`
- Port 8080 owned by `wslrelay.exe` — monitoring services should use an alternate port (e.g. 8082)
- NTFS bind mounts (`/mnt/d/...`) cause I/O errors inside containers — use WSL-native ext4 paths
- Avahi/wsdd2 multicast doesn't propagate through WSL2 NAT — discovery only works on real hardware
- DNS overrides inside the VM (`/etc/resolv.conf`) don't persist across VM restarts

Use `docker compose -f docker-compose.yml -f docker-compose.wsl.yml up -d` (or `podman-compose` equivalent) for all Windows deployments.

---

## Hardware Targets

| Target | Notes |
|--------|-------|
| Steam Machine / x86_64 PC (Linux) | Full feature set; on-demand container startup (Layer 2) is critical for gaming performance |
| Windows PC (WSL2 + Docker Engine) | Validated deployment path — Ubuntu 24.04 WSL2 + Docker Engine; see `docs/setup/windows-wsl.md` |
| Windows PC (Podman Desktop) | Validated deployment path — Podman Fedora VM; rootless alternative; see `docs/setup/windows-podman.md` |
| Raspberry Pi 4/5 (ARM64) | ARM64 image required for every service |
| NAS (Synology / TrueNAS) | Docker-compatible; native NAS shares may coexist with containerised services |

---

## Session Continuity

Decisions and findings must be written to project files as they happen — not held only in chat. Record outcomes in decision files, open questions in `Open Decisions` sections. Use `backlog task create` to track new work items rather than notes in chat.


<!-- BACKLOG.MD GUIDELINES START -->
## Backlog.md

For all task, milestone, doc, and decision management, invoke the **backlog-manager** skill.
It contains the full CLI reference, task workflow, AC/DoD conventions, and the Golden Rule.

Key invariant that applies at all times even without the skill loaded:
**Never edit files in acklog/tasks/ or acklog/drafts/ directly — always use the acklog CLI.**
<!-- BACKLOG.MD GUIDELINES END -->
