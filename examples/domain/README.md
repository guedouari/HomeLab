# Layer 2 — Domain example

This folder adds public domain access to the Layer 1 stack. Services are reachable over HTTPS via your Cloudflare-managed domain.

## What's included

| Service | Image | Purpose | Layer |
|---------|-------|---------|-------|
| Samba | `ghcr.io/servercontainers/samba` | LAN file sharing | 0 |
| AdGuard Home | `adguard/adguardhome` | DNS filtering | 0 |
| Gatus | `twinproduction/gatus` | Health dashboard | 0 |
| WireGuard | `linuxserver/wireguard` | VPN | 1 |
| **CrowdSec** | `crowdsecurity/crowdsec` | **IDS + community IP blocklist** | **1** |
| **Cloudflare dynDNS** | `timothyjmiller/cloudflare-ddns` | DNS A record updater | **2** |
| **Sablier** | `acouvreur/sablier` | On-demand container lifecycle | **2** |
| **Caddy** | `homelab-caddy` (custom build) | Reverse proxy + TLS | **2** |

## Pre-flight

### 1. Apply host firewall baseline (required)

```bash
bash scripts/setup-firewall.sh
```

Sets iptables rules and prints bouncer install instructions for automatic IP banning (CrowdSec).

### 2. Build the custom Caddy image (once)

```bash
docker build -f Dockerfile.caddy -t homelab-caddy .
```

This compiles Caddy with the Cloudflare DNS plugin and Sablier plugin. Takes ~2 minutes on first run, then cached.

### 3. DNS setup in Cloudflare

In your Cloudflare dashboard for your domain, create:
- `homelab.example.com` → A record → your public IP (dynDNS will keep this updated)
- `vpn.homelab.example.com` → A record → your public IP (Proxied: OFF — WireGuard is UDP)
- `adguard.homelab.example.com` → CNAME → `homelab.example.com`
- `status.homelab.example.com` → CNAME → `homelab.example.com`

Or use a wildcard: `*.homelab.example.com` → CNAME → `homelab.example.com`.

### 4. Router port-forwards

| Port | Protocol | Service |
|------|----------|---------|
| 80   | TCP | Caddy (HTTP → HTTPS redirect) |
| 443  | TCP | Caddy (HTTPS) |
| 51820 | UDP | WireGuard |

### 5. Cloudflare API token

```bash
cp config/cloudflare-ddns/cloudflare.json.example config/cloudflare-ddns/cloudflare.json
# Edit: fill in your API token and Zone ID
```

### 6. Copy config from Layer 1

```bash
cp -r ../wan/config ./config  # copies adguardhome, gatus, wireguard configs
# (cloudflare-ddns config handled above)
# (caddy config is already in this folder)
```

### 7. Create data directories

```bash
mkdir -p data/media data/files data/backup data/adguardhome data/gatus \
         data/wireguard data/crowdsec data/sablier data/caddy
```

### 8. Copy and edit `.env`

```bash
cp .env.example .env
# Edit: DOMAIN, ACME_EMAIL, CLOUDFLARE_API_TOKEN, SERVER_IP, WIREGUARD_URL
```

### 8. Start

```bash
docker compose up -d
```

## Verifying TLS

After startup, Caddy will request a wildcard cert from Let's Encrypt via DNS-01:

```bash
docker logs caddy 2>&1 | grep -i cert
# Look for: certificate obtained successfully
```

Then access:
- `https://adguard.homelab.example.com` → AdGuard Home
- `https://status.homelab.example.com` → Gatus

## Adding Layer 3 services

When adding a self-hosted service:

1. Add the service to `docker-compose.yml` with `restart: "no"` if using Sablier
2. Add a `handle` block in `config/caddy/Caddyfile`
3. For Sablier-managed services, add a `sablier {}` block (see Caddyfile comments)
4. `docker compose up -d`

## No-LAN-leakage

At Layer 2, services should not be reachable by public IPs at direct ports. Configure your router/firewall to:
- Allow inbound: TCP 80, TCP 443, UDP 51820 only
- Block all other inbound connections

LAN clients (and VPN clients) can still reach services directly — this only affects public internet access.
