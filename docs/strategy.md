# Project Strategy

This document describes the guiding principles and strategic decisions that shape how HomeLab is built, maintained, and extended.

---

## 1. Docker Images — linuxserver.io First

When selecting Docker images, **[linuxserver.io](https://www.linuxserver.io/) images are the default choice**. They are:

- Actively maintained by a large open-source community
- Consistent in their approach to PUID/PGID, volumes, and environment variables
- Well-documented and broadly compatible across x86_64 and ARM64

When a linuxserver image exists for a service, it should be used. Alternative images (e.g., official upstream images) are acceptable only when linuxserver does not provide one, or when there is a clear technical reason to prefer another.

---

## 2. Free and Open Source (FOSS) First

HomeLab is built on free and open-source software. Every service selected should, by default, be FOSS-licensed.

**The one intentional exception is Valve / Steam:**
- Steam and the Steam ecosystem are proprietary but treated as **first-class citizens** in this project.
- The Steam Machine use case is a core hardware target, and gaming performance is a first-order concern alongside self-hosting.
- Steam-related tooling (e.g., Proton, Steam Link, GameStream alternatives) may be included without requiring a FOSS alternative.

Outside of the Steam exception, proprietary or cloud-dependent services should be replaced, not embraced.

---

## 3. Iterative Build — LAN First

The project is built **iteratively**, layer by layer. Work begins with the LAN layer and expands only once each layer is stable and tested.

This means:
- No WAN or cloud configuration is added until the LAN stack is fully working.
- No Nextcloud layer is built until the WAN layer is validated.
- Each layer is a functional, usable product on its own — not just scaffolding for the next one.

---

## 4. Three Installation Levels

The project targets **three levels of deployment**, where each level is a strict superset of the previous:

| Level | Includes | Description |
|-------|----------|-------------|
| **LAN** | — | Local network only: ad blocking, DNS, file sharing. No internet exposure. |
| **WAN** | LAN + | Adds secure remote access: VPN (WireGuard), reverse proxy, and TLS. |
| **Nextcloud** | LAN + WAN + | Adds the full Nextcloud productivity suite (files, contacts, calendars, etc.). |

A user who only wants a LAN setup should never be required to configure WAN or Nextcloud components, and vice versa.

---

## 5. Hardware Compatibility

HomeLab targets **three home server archetypes**. Any machine that fits within one of these archetypes is supported — the categories are intentionally broad.

### Steam Machine *(and any x86_64 general-purpose PC)*
Targeting the Steam Machine covers the full range of x86_64 home servers: mini PCs, repurposed desktops, standard tower servers, and HTPCs.
- Full feature set available
- On-demand container startup (via Sablier) is critical to preserve gaming performance
- Steam / gaming workloads take priority over background services

### NAS (Synology, TrueNAS, or generic)
- Docker-compatible NAS devices run the full stack
- Native NAS file-sharing (SMB/NFS) may replace or supplement the Samba container
- Storage-heavy services (Jellyfin, Immich) are natural fits on this platform

### Raspberry Pi *(and ARM64 SBCs)*
- ARM64 support is required for all included images
- Pi 5: full feature set
- Pi 4: lighter alternatives may be needed for CPU-intensive tasks (e.g., transcoding)
- Resource constraints are a design input, not an afterthought

---

## 6. Finalized Infrastructure Decisions

These are service-level decisions that have been studied and locked in. They apply across all layers and must be taken into account when evaluating future services.

### Database Server — PostgreSQL (Single Shared Instance)

A single shared **PostgreSQL** instance is the project's relational database server, and consolidating all services onto it is an **active goal**, not just a default.

**Why a single shared instance matters for backups:**
One PostgreSQL instance means one backup job, one restore procedure, and one point of truth for all persistent service data. Splitting databases across SQLite files, MariaDB, and PostgreSQL containers means multiple backup strategies, multiple restore tests, and scattered data — a maintenance burden that grows with every new service.

**The rule:**
> If a service supports PostgreSQL, it **will** use the shared PostgreSQL instance — even if SQLite is the service's default or recommended option.

This applies across all layers. SQLite is only acceptable when a service has **no PostgreSQL support at all** (e.g., Uptime Kuma currently). The moment PostgreSQL support becomes available for such a service, migration is the expected path.

**Why PostgreSQL over MariaDB:**
- The only engine that covers all planned services — **Immich requires PostgreSQL with pgvector** and cannot use MariaDB at all
- Nextcloud officially supports PostgreSQL; no capability is lost versus MariaDB
- One engine to operate, monitor, and back up

**Instance model:** each service gets its own database and dedicated user — isolation at the credential level, not the container level.

**When evaluating a new service:** PostgreSQL compatibility is a first-order requirement. A service that requires MariaDB exclusively and has no PostgreSQL support is a strike against it.

---

## 7. Project Goal: Dynamic Configuration Generator

Once all three layers (LAN, WAN, Nextcloud) are **fully tested and working** across the target hardware platforms, the project will migrate toward a **dynamic configuration generator**. This is the defined end state of the project.

This generator will:
- Accept a set of user inputs (hardware target, desired services, domain, credentials)
- Produce a ready-to-deploy configuration tailored to that setup
- Replace manually edited `.env` files and static Compose files with generated, validated output

This migration happens only after the static configuration is proven — generated config is only as good as the reference it is built from.

---

## 8. Horizon: Multi-Node / VPS

Multi-node and VPS support are a **far-future horizon** — well beyond the project goal above, and not part of the current or near-term scope.

The nominal multi-node topology, when eventually explored, would be:
- **1 home server** (Steam Machine or NAS) running the full local stack
- **1 VPS** acting as a public-facing relay / reverse proxy (WireGuard exit node, SWAG/Caddy)
- Optionally: multiple home servers or additional VPS nodes

This horizon will only be approached once the dynamic configuration generator is complete and the single-node stack is mature.
