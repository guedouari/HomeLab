# Copilot Instructions — HomeLab

This is a **documentation and Docker Compose configuration** repository. There is no application code, no build system, and no test suite. All work is Markdown documents and Compose files.

---

## Repository Layout

```
decisions/              # Per-capability decision records (research + rationale)
  platform-choice.md   # Docker + Compose platform decision; image sourcing rules
  layer_0_lan.md       # Index of all Layer 0 capabilities and their status
  device-support-matrix.md
  layer_0_lan/
    dns.md             # DNS filtering — candidates, analysis, status
    file-sharing.md    # File sharing — candidates, analysis, status
    monitoring.md      # Monitoring — candidates, analysis, status
    database.md        # Database server — candidates, analysis, status
    prerequisites.md   # Assumptions before any service is deployed
docs/
  strategy.md          # Cross-cutting principles (image policy, DB strategy, etc.)
  dev-setup-windows.md # WSL + Docker setup guide
examples/
  lan/                 # Working Layer 0 reference implementation
    docker-compose.yml
    docker-compose.wsl.yml   # Port override for WSL2 testing
    .env.example
    README.md
plan.md                # High-level layer model and open decisions
README.md              # Project vision and hardware targets
```

---

## Layer Model (the big picture)

The project builds in strict layers. **Never add Layer N+1 content until Layer N is working and verified.**

| Layer | Scope | Status |
|-------|-------|--------|
| **0 — LAN** | DNS filtering, file sharing, monitoring, shared DB | Current focus |
| **1 — WAN** | VPN, private domain, reverse proxy + TLS, on-demand startup | Depends on Layer 0 |
| **2 — Services** | File sync, password manager, media, photo backup | Depends on Layer 1 |
| **3 — Extended** | Local LLM, GPU workloads | Depends on Layer 2 |

---

## How Decision Files Work

Every capability has a decision **folder** in `decisions/layer_0_lan/<capability>/` with these files:

| File | Contents |
|------|----------|
| `README.md` | Index: role, status, links to sub-files, constraints, **Horizon** |
| `protocol.md` | Protocol/approach landscape and elimination |
| `candidates.md` | Docker image candidates — **"Pulled & verified" column must be ✅ before selecting** |
| `networking.md` | Docker networking modes and trade-offs |
| `configuration.md` | Config design: env vars, share layout, auth model, open questions |
| `testing.md` | Verification checklist and results — **the gate for finalising status** |
| `horizon.md` | Out-of-scope ideas that came up during discussion — what the service offers in those contexts |

The **Horizon** file captures anything that came up but isn't current-scope — alternative features, future use cases, adjacent capabilities. Each entry explains what the service can actually do in that context, not just that it's deferred. Nothing is discarded; it goes to `horizon.md` instead.

**`testing.md` is the gate.** Status stays 🔍 Until it contains passing results. A service is never "decided" based on documentation alone — it must be verified running locally first.

When a service passes testing:
- Mark the result in `testing.md`
- Update `README.md` status from 🔍 to ✅
- Update the capability row in `decisions/layer_0_lan.md`
- Update `plan.md` Open Decisions if applicable
- Only then is the service name allowed in `examples/`

---

## Critical Rules

### Image verification is mandatory
Before referencing any Docker image anywhere in the project, confirm it exists by pulling it or checking the registry directly. **Do not document an image path that has not been tested.** linuxserver.io (`lscr.io`) does not provide images for every service — always check.

### No specific service or image in high-level files until confirmed working locally
`plan.md`, `README.md`, `docs/strategy.md`, `decisions/platform-choice.md`, and `decisions/layer_0_lan.md` must not name specific tools or images for a capability until that service has been verified running locally. Use capability-level language ("DNS filtering", "file sharing") until then. Specific names belong only in the individual decision files and in `examples/`.

### PostgreSQL-first
If a service supports PostgreSQL it uses the shared PostgreSQL instance — no exceptions without a documented, time-limited reason. SQLite is only acceptable when a service has no PostgreSQL support at all. MariaDB is never added as a second database engine. See `docs/strategy.md §6` and `decisions/layer_0_lan/database.md`.

### linuxserver.io preferred, not guaranteed
linuxserver images are the first choice. When no linuxserver image exists, use the official vendor image. Document which registry the image actually comes from. The `lscr.io` prefix must never be assumed — verify before documenting.

---

## Examples

`examples/lan/` is the working reference implementation for Layer 0. It must be runnable as-is after following the README pre-flight steps.

- **`docker-compose.yml`** — production target (real Linux host)
- **`docker-compose.wsl.yml`** — WSL2 port override; used with: `docker compose -f docker-compose.yml -f docker-compose.wsl.yml up -d`
- **`.env.example`** — all variables required; copy to `.env` before running
- Services configure entirely through environment variables — no bind-mounted config files unless the image requires it

Data directories are excluded from git and must be created manually before first run:
```bash
mkdir -p data/media data/files data/backup data/postgres
```

---

## WSL2 Development Setup

See `docs/dev-setup-windows.md` for the full guide. Key points relevant to this project:

- Use a named, isolated distro (`wsl --import homelab-test ...`) — never the primary distro
- Disable Windows PATH bleed: set `[interop] appendWindowsPath = false` in `/etc/wsl.conf`, then `wsl --terminate homelab-test`
- Install corporate CA certs with `sudo update-ca-certificates` before running `apt` or `curl`

---

## Hardware Targets

All service decisions must account for all three targets:

| Target | Notes |
|--------|-------|
| Steam Machine / x86_64 PC | Full feature set; gaming performance must not be degraded by background services |
| Raspberry Pi 4/5 (ARM64) | ARM64 image required for every service; Pi 4 may need lighter alternatives for transcoding |
| NAS (Synology / TrueNAS) | Docker-compatible; native NAS shares may coexist with containerised services |

---

## Session Continuity

Discussions, decisions, and findings must be written to project files as they happen — not held only in the chat. When a session ends, anything that exists only in the conversation is lost.

After each meaningful step (a decision reached, a service evaluated, a file changed, a problem diagnosed):
- Record the outcome in the appropriate file (`decisions/`, `plan.md`, decision file Status section, etc.)
- Do not defer writing until "the end" — write as you go

If a topic is discussed but no conclusion is reached, note the open question explicitly in the relevant decision file's **Open Decisions** section so the next session can pick it up without re-reading the chat.

### Saving a session snapshot

Use `/share` at the end of a working session to export the full conversation to a Markdown file. Save the output under `docs/sessions/` in the repo so the discussion history is part of the project.

Other useful commands:
- `/rename` — give the session a meaningful name (e.g. `layer0-samba-evaluation`) before sharing
- `/compact` — summarise conversation history to reduce context size while keeping key findings in scope
- `/resume` — return to a previous named session to continue where it left off

---

## Conventions

- **Markdown only** — all project content is `.md` files plus Compose/env files
- **Capability language in high-level files, specifics in decision files** — keep `plan.md` and the index free of tool names that haven't been verified
- **`examples/lan/.gitignore`** excludes `.env` and `data/` — never commit secrets or data directories
- **`decisions/device-support-matrix.md`** is the baseline for all compatibility claims — reference it when a service has OS or protocol constraints
