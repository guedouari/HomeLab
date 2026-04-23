---
id: decision-1
title: Container platform — Docker + Compose
date: '2026-04-20 15:27'
status: Accepted
---

## Context

A portable, broadly-supported container runtime is needed across x86_64 (Steam Machine / PC), ARM64 (Raspberry Pi 4/5), and NAS-compatible hardware, without vendor lock-in. The platform must be FOSS-licensed, support a declarative multi-service deployment model, and allow the generator to produce self-contained configuration files that users can run directly.

## Decision

**Docker Engine + Docker Compose.** Single-node, no orchestrator. Compose files are the deployment unit.

| Area | Decision |
|------|----------|
| Container platform | Docker Engine + Docker Compose |
| Image source | linuxserver.io preferred — verified per-service before use |
| Orchestration model | Single-node |

**Why:**
- Docker Compose is the simplest and most portable option across mini PC, Raspberry Pi, and NAS-style environments.
- Single-node keeps operations manageable for home use.
- linuxserver.io images provide consistent, well-maintained containers across `linux/amd64` and `linux/arm64` where they exist. Every image must be verified before being referenced.

**Registry preference:**

| Registry | URL | Notes |
|----------|-----|-------|
| linuxserver.io | `lscr.io` | Preferred. Proxies images independently of Docker Hub rate limits. Actively maintained; `linux/amd64` + `linux/arm64`. |
| GitHub Container Registry | `ghcr.io` | No pull rate limits for public images. Good for community/self-hosted projects. |
| Docker Hub | `docker.io` | Default registry. Rate-limited (100 pulls/6 h per IP anonymous; 200 authenticated free). |
| Quay.io | `quay.io` | No rate limits on public images. Red Hat/Fedora ecosystem. |

Images are sourced from whichever registry hosts the verified, actively maintained image for that service. Every image source must be confirmed before being documented.

**Licensing:**

| Component | Licence | Notes |
|-----------|---------|-------|
| Docker Engine (`dockerd`) | Apache 2.0 | Fully open source. |
| Docker Compose v2 | Apache 2.0 | Go rewrite; distributed as a Docker CLI plugin. |
| containerd | Apache 2.0 | Underlying runtime; CNCF graduated project. |
| Docker Desktop | Proprietary | **Not used.** Only relevant on Windows/macOS dev machines — not deployed on homelab servers. |

## Consequences

Portable across all target hardware. Compose files serve as both the reference implementation and the generator output template.

**Known limitations:**

| Area | Limitation | Mitigation |
|------|------------|------------|
| Secrets | No native vault; secrets are bind-mounted files or env vars. | `.env` files with `chmod 600`. Vault/SOPS is a Layer 2 concern. |
| HA / failover | No automatic restart across host failures. | `restart: unless-stopped` covers process crashes; full HA is out of scope. |
| Volume lifecycle | Named volumes survive `docker compose down`; `-v` destroys data. | Document volume names explicitly per service; backup is a Layer 1/2 concern. |
| Network isolation | Services on the same project share a default bridge network. | Define per-layer networks with `external: true` as the project grows. |
| Image updates | Docker does not self-update running containers when a new image is published. | Manual `docker compose pull && docker compose up -d`, or Watchtower (Layer 1 candidate). |
| Scale ceiling | Compose scales poorly beyond ~20 services on a single node. | Acceptable for homelab scale; files are largely Swarm-compatible if migration is needed. |
| WSL credential store | Rancher Desktop injects `docker-credential-secretservice`, breaking anonymous pulls. | Replace with a no-op credential helper; see WSL setup guide. |

## Alternatives

**Podman + Compose:** Rootless, daemon-less, drop-in compatible with Docker Compose syntax. Strong alternative; deferred because Docker has broader community support and tooling. Podman compatibility is tested separately (BACK-10).

**K3s / Kubernetes:** Full orchestration with HA and rolling updates. Ruled out — complexity is disproportionate for single-node homelab use; the generator would need Helm output rather than Compose files.

**Docker Swarm:** Multi-node built-in; Compose files are largely compatible. Not needed at current scale; remains a natural upgrade path if the homelab grows beyond a single node.
