# Reverse Proxy (Caddy)

## Role

Caddy is the single public-internet entry point at Layer 2. It handles:
- **TLS termination** — automatic HTTPS via Let's Encrypt, renewed automatically
- **HTTP routing** — maps subdomains to internal services
- **On-demand containers** — integrated with Sablier to start idle services on first request

All Layer 2+ services are accessed through Caddy. Direct IP:port access from the internet should be blocked at the router/firewall.

## Chosen image

**Custom build: `caddy:builder` → `caddy:alpine` with plugins**

The standard `caddy:alpine` is extended with two plugins:
- `github.com/caddy-dns/cloudflare` — DNS-01 TLS challenge (wildcard certs, no port 80 needed)
- `github.com/acouvreur/sablier/plugins/caddy` — on-demand container startup middleware

Build is via a two-stage Dockerfile in `examples/domain/`. The result is a standard Caddy binary with the plugins baked in.

| Property | Value |
|----------|-------|
| Base image | `caddy:alpine` (59 MB) |
| Extra plugins | cloudflare DNS + Sablier (~2 MB each) |
| ARM64 | ✅ (xcaddy builds for target arch) |
| Config | Caddyfile (declarative, version-controlled) |

## Why DNS-01 over HTTP-01

| Method | Port needed | Wildcard | Cloudflare API |
|--------|------------|---------|---------------|
| HTTP-01 | 80 open | ❌ | ❌ |
| DNS-01 | None (443 only) | ✅ | ✅ |

We're already using Cloudflare for dynDNS — the API token is already present. DNS-01 lets us use a single `*.homelab.example.com` certificate covering all subdomains without individual cert requests.

## See also

- [candidates.md](candidates.md) — reverse proxy comparison
- [configuration.md](configuration.md) — Caddyfile structure and Dockerfile
- [testing.md](testing.md) — test results
- [horizon.md](horizon.md) — rate limiting, basic auth, IP allowlists
