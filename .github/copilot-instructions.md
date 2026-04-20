# Copilot Instructions — HomeLab

This is a **documentation and Docker Compose configuration** repository. There is no application code, no build system, and no test suite. All work is Markdown documents, Compose files, and service config files.

---

## Repository Layout

```
decisions/                        # Per-capability decision records
  device-support-matrix.md        # Baseline device and connectivity requirements
  layer_0_lan.md                  # Layer 0 index — capabilities and status
  layer_1_wan.md                  # Layer 1 index (stub — not yet started)
  layer_2_domain.md               # Layer 2 index (stub — not yet started)
  layer_3_services.md             # Layer 3 index (stub — not yet started)
  layer_0_lan/
    prerequisites.md
    file-sharing/                 # One folder per capability
    dns/
    monitoring/
    database/                     # Out of scope for Layer 0; moved to Layer 3
docs/
  strategy.md                     # Cross-cutting principles
  dev-setup-windows.md            # WSL + Docker developer setup guide
examples/
  lan/                            # Working Layer 0 reference implementation
    docker-compose.yml
    docker-compose.wsl.yml        # WSL2 limitations documentation (not a service override)
    .env.example
    config/                       # Pre-baked service config files (mounted read-only)
      adguardhome/AdGuardHome.yaml
      gatus/config.yaml
    data/                         # Runtime data (excluded from git)
README.md
```

---

## Layer Model

The project builds in **strict layers**. Never add Layer N+1 content until Layer N is working and verified.

| Layer | Name | Scope |
|-------|------|-------|
| **0** | LAN | Isolated local network — file sharing, DNS filtering, lightweight monitoring. No internet exposure. Light security. |
| **1** | WAN | VPN (WireGuard) — secure remote access to the home LAN. Hardened security. Split-horizon DNS. |
| **2** | Domain | Public domain name — dynDNS, reverse proxy, Sablier (on-demand containers), TLS. No direct IP access; everything routes through the proxy. |
| **3** | Services | User-chosen self-hosted services. Each evaluated independently. Database introduced here when a service needs it. |

Each layer is a **strict superset** of the previous.

---

## Project Principles

These principles are applied in order when making any decision. When principles conflict, the earlier one wins.

### 1. Lighter is better — fewer containers

Prefer an image that bundles multiple needed features over running multiple separate containers. Prefer smaller images and lower RAM footprint. If a feature requires adding a sidecar container, that is a strike against the solution.

### 2. File config over wizard / UI config

Prefer services where the full configuration lives in a version-controlled file (YAML, TOML, INI, env vars). A service that can only be configured through a browser wizard or a web UI is harder to reproduce and harder to automate.

- Pre-baking a config file that skips a first-run wizard is acceptable — the result is still reproducible.
- A service that **requires** a browser for every fresh deployment is deprioritised.

### 3. Evaluate before committing

No service is added to the project until it has been:
1. Confirmed to serve a real use case for this specific setup
2. Verified as a working Docker image on the target architectures (actually pulled)
3. Tested locally with sane defaults
4. Documented in the decision folder with a passing `testing.md`

Speculative additions go in `horizon.md` files, not in the stack.

### 4. Image verification is mandatory

Before referencing any Docker image anywhere in the project, confirm it exists by pulling it or checking the registry. **Do not document an image path that has not been tested.** linuxserver.io (`lscr.io`) does not provide images for every service — always verify.

### 5. ARM64 required

Every selected image must support ARM64 (Raspberry Pi target). Verify from the manifest, not from documentation alone.

### 6. FOSS first

All services must be free and open-source. The one exception is Valve/Steam: it is a first-class citizen in this project because the Steam Machine is a core hardware target and gaming performance is a first-order concern.

---

## How Decision Folders Work

Every capability has a decision **folder** in `decisions/layer_X/<capability>/` with these files:

| File | Contents |
|------|----------|
| `README.md` | Index: role, status (🔍 / ✅), links to sub-files, constraints |
| `candidates.md` | Candidate comparison — "Pulled & verified" must be ✅ before selecting |
| `networking.md` | Docker networking modes and trade-offs |
| `configuration.md` | Config design: files, env vars, auth model, open questions |
| `testing.md` | Verification checklist and results — **the gate for finalising status** |
| `horizon.md` | Out-of-scope ideas that surfaced during discussion |

**`testing.md` is the gate.** Status stays 🔍 until it contains passing results.

When a service passes testing:
1. Mark results in `testing.md`
2. Update `README.md` status → ✅
3. Update the capability row in `decisions/layer_X_<name>.md`
4. Add the service to `examples/` only then

---

## Critical Rules

### No service name in high-level files until verified

`README.md`, `docs/strategy.md`, `decisions/layer_*.md` index files must not name specific tools or images for a capability until that service has been verified running locally. Use capability-level language ("DNS filtering", "file sharing") until then. Specific names belong only in the individual decision files and `examples/`.

### Database: introduce when needed

Do not add PostgreSQL (or any database) until a specific Layer 3 service that needs it is being deployed. When added: single shared instance, one database + dedicated user per service. Choose `postgres:17` or `pgvector/pgvector:pg17` only when a confirmed service requires pgvector — not preemptively.

---

## Examples

`examples/lan/` is the working reference implementation for Layer 0. It must be runnable after following the README pre-flight steps.

- `docker-compose.yml` — production target (real Linux host)
- `docker-compose.wsl.yml` — WSL2 limitations documentation (not a service file; explains why some tests behave differently on WSL2)
- `.env.example` — all variables with defaults; copy to `.env` before running
- `config/` — pre-baked config files mounted read-only into containers (`/config/` or equivalent)
- `data/` — runtime state, excluded from git, created manually before first run

Services prefer file-based configuration over environment variables when the image supports it. Config files live in `examples/lan/config/<service>/` and are mounted read-only.

Data directories to create before first run:
```bash
mkdir -p data/media data/files data/backup data/adguardhome data/gatus
```

---

## WSL2 Development Notes

See `docs/dev-setup-windows.md` for the full guide. Key points:

- Use a named isolated distro (`wsl --import homelab-test ...`) — never the primary distro
- Disable Windows PATH bleed: `[interop] appendWindowsPath = false` in `/etc/wsl.conf`, then `wsl --terminate homelab-test`
- Activate corporate CA certs with `sudo update-ca-certificates` before `apt` or `curl`
- WSL2 limitations that affect testing:
  - `LanmanServer` on Windows intercepts port 445 on all interfaces → `net view \\<WSL-IP>` fails from same machine
  - NTFS bind mounts (`/mnt/d/...`) cause I/O errors inside containers — use WSL-native ext4 paths (`~/`)
  - WSL2 internal DNS stub binds `10.255.255.254:53` → binding `0.0.0.0:53` conflicts; bind to specific eth0 IP instead
  - Avahi/wsdd2 multicast doesn't propagate through WSL2 NAT → discovery only works on real hardware

These are testing environment constraints, not bugs in the services.

---

## Hardware Targets

All service decisions must account for all three targets:

| Target | Notes |
|--------|-------|
| Steam Machine / x86_64 PC | Full feature set; gaming performance must not be degraded by background services; Sablier at Layer 2 is critical |
| Raspberry Pi 4/5 (ARM64) | ARM64 image required for every service; Pi 4 may need lighter alternatives for CPU-intensive tasks |
| NAS (Synology / TrueNAS) | Docker-compatible; native NAS shares may coexist with containerised services |

---

## Session Continuity

Decisions and findings must be written to project files as they happen — not held only in chat. When a session ends, anything that exists only in the conversation is lost.

After each meaningful step:
- Record the outcome in the appropriate decision file
- If a topic is discussed without a conclusion, note the open question in the relevant `Open Decisions` section

The checkpoint system in the session workspace (`~/.copilot/session-state/`) captures intermediate state across compactions. Use it alongside project files.
