# Product Requirements Document — HomeLab Config Generator

**Status:** Draft  
**Author:** John (PM agent) × Sguedouari  
**Date:** 2026-04-23  
**Version:** 1.0

---

## 1. Problem Statement

Standing up a self-hosted homelab with Docker Compose requires editing multiple files correctly in the right order: `docker-compose.yml`, `.env`, and service-specific config files (DNS filter YAML, VPN keys, reverse proxy config). For the author this is manageable — for a first-time visitor who discovers the repo, it is a barrier.

The gap: the `examples/` folder proves the stack works, but it requires manual customisation that is error-prone and undocumented at the config level. There is no guided path from "I want a homelab" to "I have a running homelab."

---

## 2. Goal

Produce a **CLI wizard** that interviews the user and writes a complete, ready-to-run deployment folder. Running the wizard again on the same output updates it. The output is git-trackable so the user has a restore point and a change history.

---

## 3. Users

| User | Context | Expectation |
|------|---------|-------------|
| **Author (Sguedouari)** | Knows the stack, wants to regenerate or update a config quickly | Fast, no hand-holding, accurate output |
| **Stranger (discovered repo)** | No prior knowledge of the stack | Guided, no assumptions, clear output with next steps |

Both users run the same wizard. The wizard must not require tribal knowledge to complete.

---

## 4. Non-Goals

- No runtime management (start/stop/logs) — the generator writes files, the user runs `docker compose`
- No cloud deployment — local/LAN only at this stage
- No service configuration beyond what's needed to boot (wizard scope = infrastructure, not application settings)
- No extensible plugin system — service catalog is curated and tested; users who want more add it manually

---

## 5. User Journey

```
npx homelab-gen   (or: npm run dev -- generate)

┌─ Wizard ───────────────────────────────────────────────────────┐
│                                                                  │
│  1. What layer do you want to deploy?                           │
│     ○ 0 — LAN (DNS filter, file sharing, monitoring)            │
│     ○ 1 — WAN (+ VPN access from outside)                       │
│     ○ 2 — Domain (+ public domain, TLS, reverse proxy)          │
│     ○ 3 — Services (+ self-hosted apps)                         │
│                                                                  │
│  2. What is your server hardware?                               │
│     ○ Linux PC / Steam Machine (x86_64)                         │
│     ○ Raspberry Pi 4/5 (ARM64)                                  │
│     ○ NAS (Synology / TrueNAS)                                  │
│     ○ Windows — WSL2 + Docker Engine                            │
│     ○ Windows — Podman Desktop                                  │
│                                                                  │
│  3. What is your server's LAN IP?  [auto-detect suggestion]     │
│                                                                  │
│  4. What is your timezone?  [auto-detect suggestion]            │
│                                                                  │
│  [if layer >= 1]                                                 │
│  5. VPN subnet CIDR?  [default: 10.8.0.0/24]                   │
│                                                                  │
│  [if layer >= 2]                                                 │
│  6. Public domain name?                                         │
│  7. DNS provider API token?                                     │
│  8. ACME email for TLS certs?                                   │
│                                                                  │
│  [if layer == 3]                                                 │
│  9. Which services do you want?  (checkbox list)                │
│     ☑ File sync (e.g. cloud file storage replacement)           │
│     ☑ Contacts (CardDAV)                                        │
│     ☑ Calendar (CalDAV)                                         │
│     ☐ Photos                                                     │
│                                                                  │
│  [if Windows hardware selected]                                 │
│  10. Apply WSL port overrides?  [Y/n — default yes]             │
│      Remaps conflicting ports (DNS→eth0 IP, monitoring→alt port)│
│                                                                  │
│  → Generating output/...                                        │
│  ✓ Written to ./output/                                         │
│  → Next step: cd output && docker compose up -d                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 6. Output Specification

### Location

Written to `./output/` by default (configurable via `--out`). The output folder is **intended to be git-tracked** — it is a snapshot of the user's deployment config, versioned alongside the repo or in a separate git repo.

Re-running the wizard overwrites the output folder. This is the "update my config" workflow.

### Contents (vary by layer)

```
output/
├── docker-compose.yml          # base compose (all layers)
├── docker-compose.override.yml # WSL/platform overrides (Windows only)
├── .env                        # all resolved variables, no placeholders
├── config/
│   ├── dns-filter/             # layer 0: DNS filter config
│   ├── file-sharing/           # layer 0: SMB config
│   ├── monitoring/             # layer 0: health check config
│   ├── vpn/                    # layer 1: VPN config + key stubs
│   ├── firewall/               # layer 1: firewall rules
│   ├── proxy/                  # layer 2: reverse proxy config
│   └── services/               # layer 3: per-service config
└── README.md                   # generated: what was created + next steps
```

### Constraints

- No placeholder values in `.env` — all fields resolved at generation time or wizard fails
- `docker-compose.yml` must be runnable with `docker compose up -d` immediately after generation
- Windows targets always produce a `docker-compose.override.yml` (platform overrides)

---

## 7. Hardware Target Model

The hardware target drives two things: **image architecture** (ARM64 vs x86_64) and **platform overrides** (WSL port remapping, bind addresses).

| Target | Architecture | Platform overrides |
|--------|--------------|--------------------|
| Linux PC / Steam Machine | x86_64 | None |
| Raspberry Pi 4/5 | ARM64 | None |
| NAS | x86_64 or ARM64 | None |
| Windows — WSL2 + Docker Engine | x86_64 | WSL override file, DNS bind to eth0 IP |
| Windows — Podman Desktop | x86_64 | WSL override file, DNS bind to eth0 IP, podman-compose compatible labels |

Hardware target is asked **once** at step 2, before any layer-specific questions. It applies globally to the entire generated output — it is a property of the machine, not of the layer.

---

## 8. Service Catalog (Layer 3)

Fixed curated list — only services that have been tested and documented. Users may add additional services manually after generation.

| Service | Category | Replaces |
|---------|----------|---------|
| File sync | Files | Google Drive / iCloud / OneDrive |
| Contacts | PIM | Google Contacts / iCloud Contacts |
| Calendar | PIM | Google Calendar / iCloud Calendar |
| Photos | Media | Google Photos / iCloud Photos |

Services are selected independently. Each selected service adds its compose fragment and config to the output.

---

## 9. Re-invocation (Update Flow)

When `./output/` already exists:

1. Wizard detects existing output and reads the previous inputs (from a generated `.homelab-config.json` inside the output folder)
2. Pre-fills all answers with previous values
3. User can accept defaults or change any value
4. Output is rewritten atomically (temp dir → rename)

This makes "I want to add a service" or "I moved to a new domain" a first-class workflow.

---

## 10. Success Criteria

| Criterion | Measure |
|-----------|---------|
| A stranger can go from zero to running stack | `npx homelab-gen` → `docker compose up -d` with no manual file editing |
| Output is git-trackable | No secrets in filenames; `.env` is the only sensitive file; rest is plain config |
| Re-run is non-destructive | Re-running with same inputs produces identical output; changed inputs produce correct diff |
| Windows users get working configs | WSL override file generated; DNS bind address set; port remapping applied |
| Layer 0 works standalone | Layer 0 output runs without layer 1/2/3 dependencies |
| Service selection is independent | Picking "Contacts" without "Photos" produces a valid compose with only the selected services |

---

## 11. Open Questions

| Question | Status | Notes |
|----------|--------|-------|
| Output location | Open | Keep `examples/` as the reference until generation is implemented; output path deferred until first generator task |
| DNS provider / ddns credentials | Open | The concern is dynamic IP → domain mapping; the specific ddns service and what credentials it needs is deferred to the Layer 2 implementation task |
| VPN key generation | Open | What the VPN solution requires (keypairs, pre-shared keys, stubs) is deferred to the Layer 1 implementation task |
| NAS hardware sub-targets | Open | Synology vs TrueNAS SCALE differ in Docker support; may need separate handling |

---

## 12. Out of Scope (Horizon)

- Multi-node / VPS deployment
- Runtime management (start/stop via CLI)
- Web UI wizard
- Automated updates / Watchtower integration
