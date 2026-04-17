# HomeLab - Platform Choice (Final)

This file records finalized platform decisions for the current scope.

## Final Decisions

| Area | Decision |
|------|----------|
| Container platform | Docker Engine + Docker Compose |
| Image source | linuxserver.io (preferred for all services where available) |
| Orchestration model | Single-node |

## Preferred / Proposed (not yet finalized)

| Area | Candidate | Notes |
|------|-----------|-------|
| Reverse proxy (Layer 1) | SWAG (linuxserver/swag) | Preferred; aligns with linuxserver ecosystem |
| On-demand startup | Sablier | Preferred; starts services on request, stops after idle |

## Why these choices

- Docker Compose is the simplest and most portable option across mini PC, Raspberry Pi, and NAS-style environments.
- Single-node keeps operations manageable for home use.
- linuxserver.io images provide consistent, well-maintained containers across ARM64 and x86_64.
- SWAG is the preferred reverse proxy to align with linuxserver images and established community patterns.
- Sablier preserves host resources by starting non-essential services only when requested.

---

## Docker — Extended Analysis

### Registry Availability

| Registry | URL | Notes |
|----------|-----|-------|
| Docker Hub | `docker.io` | Default registry; largest image catalogue. Anonymous pulls are rate-limited (100 pulls/6 h per IP). Authenticated free accounts get 200 pulls/6 h. |
| GitHub Container Registry | `ghcr.io` | No pull rate limits for public images. Good for self-hosted or community projects. Requires a GitHub account to push. |
| Quay.io | `quay.io` | Red Hat-operated; no rate limits on public images. Commonly used for RHEL/Fedora ecosystem images. |
| linuxserver.io | `lscr.io` | Preferred source for this project. Proxies and re-hosts their images independently of Docker Hub to avoid rate limits. Actively maintained; supports `linux/amd64` and `linux/arm64`. |
| Self-hosted (e.g. Gitea, Zot, Harbor) | internal | Future option for private images or caching. Not in scope for Layer 0. |

**Practical implication:** All Layer 0 images are sourced from `lscr.io`. This avoids Docker Hub rate limits entirely and keeps the image supply chain within a single, community-maintained source.

---

### Open Source Friendliness

| Component | Licence | Notes |
|-----------|---------|-------|
| Docker Engine (`dockerd`) | Apache 2.0 | Fully open source. The daemon, CLI, and containerd runtime are all OSS. |
| Docker Compose v2 | Apache 2.0 | Rewritten in Go; distributed as a Docker CLI plugin. Replaces the Python v1 tool. |
| containerd | Apache 2.0 | The underlying container runtime; a CNCF graduated project. |
| Docker Desktop | Proprietary (paid for large orgs) | **Not used here.** Only relevant on Windows/macOS developer machines. Not deployed on the homelab server. |
| OCI compliance | Standard | Docker images and runtimes follow the Open Container Initiative spec, ensuring portability to Podman, containerd, and others. |

**Key point:** Docker Engine + Docker Compose is entirely open source and free for any use case, including commercial. The proprietary licensing concerns around "Docker" apply only to Docker Desktop, which is irrelevant for a Linux server deployment.

---

### Ecosystem Limitations

| Area | Limitation | Mitigation / Notes |
|------|------------|--------------------|
| **Secrets management** | `docker compose` has no native secrets vault. Secrets defined in Compose files are bind-mounted plaintext files or environment variables. | Use `.env` files with restricted permissions (`chmod 600`). Vault/SOPS integration is a Layer 2 concern. |
| **No built-in HA / failover** | Single-node Compose has no automatic container restart across host failures. | `restart: unless-stopped` policy handles process crashes. Full HA requires Swarm or Kubernetes — out of scope. |
| **Volume lifecycle** | Named volumes are not automatically backed up and survive `docker compose down`. Accidental `docker compose down -v` destroys data. | Document volume names explicitly per service. Backup strategy is a Layer 1/2 concern. |
| **Network isolation** | All Compose services on the same project share a default bridge network. Cross-stack networking requires explicit `external` networks. | Define per-layer networks with `external: true` as the project grows. |
| **No built-in image updates** | Docker does not self-update running containers when a new image is published. | Watchtower or manual `docker compose pull && docker compose up -d` is required. Watchtower is a candidate for Layer 1. |
| **Upgrade path ceiling** | Docker Compose scales poorly beyond ~20 services on a single node before operational complexity grows. Migration to Swarm or K3s would be a breaking change. | Acceptable for homelab scale. Compose files are largely compatible with Swarm if migration is needed later. |
| **Credential store (WSL-specific)** | On WSL, Rancher Desktop injects `docker-credential-secretservice` into PATH, breaking anonymous pulls from public registries. | Replace with a no-op credential helper at `/usr/local/bin/docker-credential-secretservice` and set `"auths": {}` in `/root/.docker/config.json`. See WSL setup notes. |

---

## Notes

- LAN-only services remain LAN-only regardless of proxy choice.
- Service-specific compatibility stays in each service/layer decision file.
- A decision moves from "preferred/proposed" to "final" only when documented as such in its own decision file.

