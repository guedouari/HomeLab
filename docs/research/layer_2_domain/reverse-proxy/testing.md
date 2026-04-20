# Reverse Proxy (Caddy) — Test Results

## Custom build

```dockerfile
FROM caddy:builder AS builder
RUN xcaddy build \
    --with github.com/caddy-dns/cloudflare \
    --with github.com/acouvreur/sablier/plugins/caddy

FROM caddy:alpine
COPY --from=builder /usr/bin/caddy /usr/bin/caddy
```

Build command: `docker build -f Dockerfile.caddy -t homelab-caddy .`

Build time: ~96 seconds (downloads Go deps and compiles). Only needed once — image is cached.

Built image size: **109 MB** (vs 59 MB base — 50 MB for Go deps + plugins).

## Plugin verification

```
docker run --rm homelab-caddy caddy list-modules | grep -E 'cloudflare|sablier|dns'
```

Output:
```
tls.ech.publishers.dns
dns.providers.cloudflare       ✅ Cloudflare DNS-01 module loaded
http.handlers.sablier          ✅ Sablier middleware loaded
```

## HTTP serving test

Minimal Caddyfile:
```
:8899 {
  respond "homelab-caddy ok" 200
}
```

```bash
docker run -d --name caddy-test \
  -p 8899:8899 \
  -v ./Caddyfile:/etc/caddy/Caddyfile:ro \
  homelab-caddy

curl http://localhost:8899
# → homelab-caddy ok
```

✅ HTTP serving works.

## TLS / DNS-01 challenge

> Cannot be tested without a real Cloudflare API token and a domain. On real hardware:
> 1. Set `CLOUDFLARE_API_TOKEN`, `DOMAIN`, `ACME_EMAIL` in `.env`
> 2. Start the compose stack
> 3. Caddy will automatically request a wildcard cert for `*.${DOMAIN}` via DNS-01
> 4. Check `docker logs caddy` for cert issuance — look for `certificate obtained successfully`
> 5. Access `https://adguard.${DOMAIN}` — should show AdGuard Home over HTTPS

## Sablier plugin

Plugin is loaded (verified via `list-modules`). End-to-end test (starting a container on first request) requires the full stack running with a configured Sablier service. Deferred to Layer 3 service integration tests.

## Summary

| Check | Result |
|-------|--------|
| Custom build compiles | ✅ |
| ARM64 manifest (base caddy:alpine) | ✅ |
| `dns.providers.cloudflare` loaded | ✅ |
| `http.handlers.sablier` loaded | ✅ |
| HTTP serving | ✅ |
| TLS DNS-01 challenge | ⚠️ Requires real Cloudflare credentials + domain |
| Sablier on-demand | ⚠️ Requires full stack — test at Layer 3 |
