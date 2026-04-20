# Sablier — Candidate Evaluation

## Context

Sablier is the only mature, actively-maintained on-demand container lifecycle manager designed specifically for homelab-style use. There are no meaningful competing images.

## Comparison

| Tool | Size | ARM64 | Approach | Notes |
|------|------|-------|----------|-------|
| `acouvreur/sablier` | 47 MB | ✅ | Docker API + reverse proxy plugins | Purpose-built, Caddy/Traefik plugins |
| Manual `docker stop` / `docker start` scripts | 0 MB | ✅ | Shell scripts | No waiting page, no automatic start on request |
| Kubernetes KEDA | Large | ✅ | Scale-to-zero | Requires Kubernetes — out of scope |

## Decision: `acouvreur/sablier`

No real alternative exists in the Docker/compose space. `acouvreur/sablier` is purpose-built, has official Caddy and Traefik plugins, and is the only solution that provides a clean "waiting" page UX while the container starts.

47 MB is acceptable for the function it provides — there is no lighter alternative that does the same job.
