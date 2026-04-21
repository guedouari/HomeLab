# Monitoring — Candidates

## Comparison

All candidates evaluated against the constraints: single container, ARM64, HTTP + TCP + DNS checks, lightest footprint, reproducible config.

| | **Gatus** | **Vigil** | **Uptime Kuma** | **Statping-NG** |
|---|---|---|---|---|
| **Runtime** | Go binary | Rust binary | Node.js | Go + assets |
| **Image size** | ~24 MB | ~30 MB | ~562 MB | ~30 MB |
| **RAM typical** | ~30 MB | ~15 MB | ~150 MB | ~60 MB |
| **Config method** | YAML file ✅ | INI file ✅ | Web UI wizard ❌ | Web UI wizard ❌ |
| **First-run friction** | None — mount config, start ✅ | None ✅ | DB + account wizard ❌ | Web setup ❌ |
| **Reproducible** | ✅ config is code | ✅ config is code | ❌ state in SQLite | ❌ state in DB |
| **HTTP checks** | ✅ | ✅ | ✅ | ✅ |
| **TCP checks** | ✅ | ✅ | ✅ | ✅ |
| **DNS checks** | ✅ | ❌ | ✅ | ❌ |
| **ARM64** | ✅ | ✅ | ✅ | ✅ |
| **Active maintenance** | ✅ daily commits | ✅ active | ✅ very active | ⚠️ slowed |
| **Dashboard quality** | Good — clean status page | Minimal — status page only | Excellent — reactive UI | Good |
| **Notifications** | 30+ providers incl. ntfy | Email, Slack, Discord | 90+ providers | Slack, email, webhooks |
| **Image size verified** | ✅ 23.5 MB pulled | Not pulled | ✅ 562 MB pulled | Not pulled |

---

## Decision: Gatus

**Image:** `twinproduction/gatus:latest`
**Digest:** `sha256:ce650981b5018de1c9e725f1c64015f9051e21e1a4d2bc9eea70dee0d51e7c40`

### Why

- **24x lighter than Uptime Kuma** (24 MB vs 562 MB image; ~30 MB vs ~150 MB RAM)
- **Zero first-run friction** — mount a YAML file, container starts immediately checking services. No web wizard, no DB setup, no account creation.
- **Config as code** — the entire monitoring setup lives in one version-controlled YAML file. Reproducible from scratch.
- **DNS checks** — needed to verify AdGuard Home is resolving. Vigil lacks this.
- Supports all required check types: HTTP, TCP, DNS
- ntfy notifications supported natively

### Why not Uptime Kuma

Uptime Kuma has the best UI of the group. However:
- 562 MB image (vs 24 MB) — a 24x size penalty for aesthetics
- State lives in SQLite; setup requires a browser wizard on every fresh deployment
- Not reproducible without manual export/import

It is the right choice for users who want a polished UI and don't care about image size. It is not the right choice for this project's constraints.

### Why not Vigil

Vigil is lighter on RAM but has no DNS check support. DNS monitoring is required to verify AdGuard Home.

### Why not Statping-NG

Active maintenance has slowed. Requires a web wizard. No advantage over Gatus for this use case.

---

## Image Size Reference (measured locally)

| Image | Pulled size |
|-------|------------|
| `twinproduction/gatus:latest` | 23.5 MB |
| `louislam/uptime-kuma:2` | 562.2 MB |
