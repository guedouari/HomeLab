# Reverse Proxy — Candidate Evaluation

## Criteria (in priority order)

1. Lighter is better — smallest footprint
2. File config over wizard/UI — reproducible, version-controlled
3. ARM64 required
4. Sablier integration
5. Automatic TLS (Let's Encrypt)

## Candidates

| Image | Size | ARM64 | Config | Sablier | TLS |
|-------|------|-------|--------|---------|-----|
| `caddy:alpine` (+plugins) | ~65 MB | ✅ | Caddyfile (simple) | Plugin available | Auto via DNS-01 or HTTP-01 |
| `traefik:latest` | ~140 MB | ✅ | Labels + YAML | Native middleware | Auto |
| `nginx` + `certbot` | ~50 MB + ~70 MB | ✅ | nginx.conf (verbose) | Via Sablier API | Manual via certbot cron |
| `linuxserver/swag` | ~350 MB | ✅ | nginx.conf | No native | Auto (nginx + certbot) |
| Nginx Proxy Manager | ~250 MB | ✅ | Web UI only | No | Auto |

## Decision: Caddy (custom build)

**Why not Traefik:** Traefik is label-driven — config lives in docker-compose labels spread across all service definitions. While this is technically "file config", it's fragmented and harder to read as a whole. Caddyfile is a single, human-readable file where all routing is visible at once. Traefik is also 2× heavier.

**Why not Nginx Proxy Manager:** Web UI only — violates the file-config principle outright.

**Why not SWAG:** Bundles nginx + certbot + a large set of proxy templates. Most of the templates are unused, and certbot needs cron-based renewal. 350 MB is excessive for our needs.

**Why not plain nginx + certbot:** Two containers, manual cert renewal, verbose config syntax. More setup than Caddy for the same outcome.

**Why Caddy:**
- Caddyfile is the most concise and readable reverse proxy config format
- Automatic TLS with zero configuration (just an email address)
- DNS-01 challenge (Cloudflare) available as a plugin — single wildcard cert covers all subdomains
- Sablier plugin available — on-demand containers without extra infrastructure
- Custom build via `xcaddy` is reproducible (Dockerfile in git)
- Base image is 59 MB (alpine); plugins add ~5 MB
