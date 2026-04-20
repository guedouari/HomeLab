# Project Strategy

This document describes the guiding principles and strategic decisions that shape how HomeLab is built, maintained, and extended.

---

## 1. Docker Images — Lighter is Better

When selecting Docker images, the guiding rule is: **fewer containers, lighter images, less to operate**.

- Prefer an image that bundles multiple needed features over running multiple separate containers
- Prefer official vendor images or well-maintained community images (e.g., linuxserver.io) over custom Dockerfiles
- **linuxserver.io** images are a good default when they exist — consistent PUID/PGID handling, well-documented, ARM64 support
- Prefer the official upstream image when linuxserver doesn't cover a service, or when there is a clear technical reason

**Image verification is mandatory.** Before any image is referenced anywhere in the project, confirm it exists by pulling it from the registry or checking the source directly. Do not document an image path that has not been tested.

---

## 2. Free and Open Source (FOSS) First

HomeLab is built on free and open-source software. Every service selected should, by default, be FOSS-licensed.

**The one intentional exception is Valve / Steam:**
- Steam and the Steam ecosystem are proprietary but treated as **first-class citizens** in this project.
- The Steam Machine use case is a core hardware target, and gaming performance is a first-order concern alongside self-hosting.
- Steam-related tooling (e.g., Proton, Steam Link, GameStream alternatives) may be included without requiring a FOSS alternative.

Outside of the Steam exception, proprietary or cloud-dependent services should be replaced, not embraced.

---

## 3. Iterative Build — Layer by Layer

The project is built **iteratively**, one layer at a time. Each layer is a functional, usable product on its own — not just scaffolding for the next.

No layer is started until the previous is tested and stable.

---

## 4. Four Layers

| Layer | Name | Scope |
|-------|------|-------|
| **0** | LAN | Isolated local network baseline — file sharing, DNS filtering, lightweight monitoring. No internet exposure. Lighter security. |
| **1** | WAN | VPN access to the LAN from outside. Hardened security. Services reachable by domain name via VPN/LAN split-horizon DNS. |
| **2** | Domain | Public domain name — dynDNS, reverse proxy, Sablier (on-demand containers). No direct IP access; everything routes through the proxy. Hardened security, no LAN leakage. |
| **3** | Services | User-chosen services — case studies for replacing cloud/platform dependency (e.g., Nextcloud + modules to replace Google/Apple). Each service is evaluated and added independently. |

Each layer is a **strict superset** of the previous. A Layer 2 deployment includes all of Layers 0, 1, and 2.

### Layer 0 — LAN
Isolated, local network only. Services are accessed by IP or local DNS name. Security is light — the LAN is trusted. No services are exposed to the internet.

Core services: DNS filtering, file sharing, lightweight monitoring.

### Layer 1 — WAN (VPN)
WireGuard VPN gives trusted devices access to the home LAN from outside. Security is hardened at this layer — the VPN endpoint is the only thing exposed to the internet. Services remain accessible by domain name via split-horizon DNS (local AdGuard Home resolves domain → internal IP for LAN/VPN clients).

### Layer 2 — Domain
A public domain name makes services reachable from the internet without a VPN. A reverse proxy (Caddy or Traefik) handles TLS termination and routing. Sablier enables on-demand container startup to preserve resources (critical for Steam Machine targets). Direct IP:port access to services is locked — everything routes through the proxy. No LAN leakage.

### Layer 3 — Services
User-chosen self-hosted services. Each is evaluated independently: is it worth running? Does it genuinely replace a cloud dependency? Does it work across all target devices? A service is not added until those questions are answered.

The default case study: replacing Google/Apple dependency with Nextcloud + modules (contacts, calendar, files, photos).

---

## 5. Service Selection: Evaluate Before Committing

No service is added to the project until it has been:
1. Confirmed to serve a real use case for this setup
2. Verified as a working Docker image on the target architectures
3. Tested locally with sane defaults

Speculative additions (e.g., "we might want this later") are captured in `horizon.md` files, not in the stack.

---

## 6. Database: Introduce When Needed

A shared PostgreSQL instance is the preferred database backend when multiple services need a relational database. However:

- **Do not add PostgreSQL until a service that needs it is actually being deployed**
- When it is added, use a single shared instance (one database + user per service) to simplify backups and operations
- pgvector or other extensions are added only when a specific service requires them — not preemptively

SQLite is acceptable for services that only support SQLite. The goal is operational simplicity, not uniformity for its own sake.

---

## 7. Hardware Compatibility

HomeLab targets **three home server archetypes**. Any machine that fits within one of these archetypes is supported.

### Steam Machine *(and any x86_64 general-purpose PC)*
- Full feature set available
- On-demand container startup (Sablier, Layer 2) is critical to preserve gaming performance
- Steam / gaming workloads take priority over background services

### NAS (Synology, TrueNAS, or generic)
- Docker-compatible NAS devices run the full stack
- Native NAS file-sharing (SMB/NFS) may replace or supplement the Samba container
- Storage-heavy services are natural fits on this platform

### Raspberry Pi *(and ARM64 SBCs)*
- ARM64 support is required for all included images
- Pi 5: full feature set
- Pi 4: lighter alternatives may be needed for CPU-intensive tasks
- Resource constraints are a design input, not an afterthought

---

## 8. Long-Term Goal: Dynamic Configuration Generator

Once all four layers are **fully tested and working** across the target hardware platforms, the project will migrate toward a **dynamic configuration generator**.

This generator will:
- Accept user inputs (hardware target, desired services, domain, credentials)
- Produce a ready-to-deploy configuration tailored to that setup
- Replace manually edited `.env` files and static Compose files with generated, validated output

This migration happens only after the static configuration is proven — generated config is only as good as the reference it is built from.

---

## 9. Horizon: Multi-Node / VPS

Multi-node and VPS support are a far-future horizon — well beyond the dynamic configuration generator goal.

The nominal topology, when eventually explored:
- **1 home server** running the full local stack
- **1 VPS** as a public-facing relay / reverse proxy (WireGuard exit node)
- Optionally: multiple home servers or additional VPS nodes


This document describes the guiding principles and strategic decisions that shape how HomeLab is built, maintained, and extended.

---

## 1. Docker Images — linuxserver.io First

When selecting Docker images, **[linuxserver.io](https://www.linuxserver.io/) images are the default choice**. They are:

- Actively maintained by a large open-source community
- Consistent in their approach to PUID/PGID, volumes, and environment variables
- Well-documented and broadly compatible across x86_64 and ARM64

When a linuxserver image exists for a service, it should be used. Alternative images (e.g., official upstream images) are acceptable only when linuxserver does not provide one, or when there is a clear technical reason to prefer another.

**Image verification is mandatory.** Before any image is referenced anywhere in the project, confirm it exists by pulling it from the registry or checking the source directly. Do not document an image path that has not been tested. Linuxserver does not cover every service — always verify before assuming.

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
- Storage-heavy services (Jellyfin) are natural fits on this platform

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

This applies across all layers. SQLite is only acceptable when a service has **no PostgreSQL support at all**. The moment PostgreSQL support becomes available for such a service, migration is the expected path.

**Why PostgreSQL over MariaDB:**
- The only engine that covers all planned service categories, including those that require PostgreSQL with the pgvector extension and cannot use MariaDB at all
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
