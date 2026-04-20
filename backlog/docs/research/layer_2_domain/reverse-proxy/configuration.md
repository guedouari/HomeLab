# Reverse Proxy — Configuration

## Dockerfile (custom Caddy build)

Located at `examples/domain/Dockerfile.caddy`. Built once with:

```bash
docker build -f Dockerfile.caddy -t homelab-caddy .
```

```dockerfile
FROM caddy:builder AS builder
RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare \
    --with github.com/acouvreur/sablier/plugins/caddy

FROM caddy:alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

## Environment variables

| Variable | Example | Description |
|----------|---------|-------------|
| `DOMAIN` | `homelab.example.com` | Your domain (Cloudflare managed) |
| `ACME_EMAIL` | `you@example.com` | Let's Encrypt notification email |
| `CLOUDFLARE_API_TOKEN` | `...` | Cloudflare API token with `Zone.DNS:Edit` permission |

## Caddyfile structure

Located at `examples/domain/config/caddy/Caddyfile`:

```
{
  email {$ACME_EMAIL}
}

*.{$DOMAIN}, {$DOMAIN} {
  tls {
    dns cloudflare {$CLOUDFLARE_API_TOKEN}
  }

  # AdGuard Home
  @adguard host adguard.{$DOMAIN}
  handle @adguard {
    reverse_proxy localhost:3000
  }

  # Gatus health dashboard
  @status host status.{$DOMAIN}
  handle @status {
    reverse_proxy localhost:8080
  }

  # Sablier on-demand services (Layer 3 — add handles here as services are added)
  # Example:
  # @myservice host myservice.{$DOMAIN}
  # handle @myservice {
  #   sablier {
  #     group myservice
  #     session_duration 1h
  #     dynamic {
  #       display_name "My Service"
  #       theme hacker-terminal
  #     }
  #   }
  #   reverse_proxy localhost:<service-port>
  # }

  handle {
    respond "Not found" 404
  }
}
```

## Cloudflare API token setup

1. Go to Cloudflare Dashboard → Profile → API Tokens
2. Create Token → Custom Token
3. Permissions: `Zone → DNS → Edit`
4. Zone Resources: `Include → Specific zone → your domain`
5. Copy the token to `.env` as `CLOUDFLARE_API_TOKEN`

Caddy uses this token to create a DNS TXT record for the ACME DNS-01 challenge. The cert is issued without any port needing to be open.

## Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 80 | TCP | HTTP → redirect to HTTPS |
| 443 | TCP | HTTPS (TLS terminated by Caddy) |

Port 80 and 443 must be forwarded on the router to the server's LAN IP.

## Host mode networking

Caddy runs in `network_mode: host`. This lets it reach all other host-mode services (AdGuard Home, WireGuard, Samba) and bridge-mode services (Gatus on localhost:8080) without any extra network configuration. All `reverse_proxy` targets use `localhost:<port>`.

## TLS certificate storage

Certs are stored in `./data/caddy/`. Back up this directory — losing it means re-requesting certs (Let's Encrypt has rate limits: 5 cert requests per domain per week).
