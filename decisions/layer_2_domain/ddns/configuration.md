# dynDNS (Cloudflare) — Configuration

## Chosen image

`timothyjmiller/cloudflare-ddns:latest` — 1.2 MB, ARM64, Go binary.

## Config file

Located at `examples/domain/config/cloudflare-ddns/cloudflare.json`:

```json
{
  "cloudflare": [
    {
      "authentication": {
        "api_token": "YOUR_CLOUDFLARE_API_TOKEN"
      },
      "zone_id": "YOUR_ZONE_ID",
      "subdomains": [
        {
          "name": "",
          "proxied": false,
          "comment": "Root domain — updated to current public IP"
        },
        {
          "name": "vpn",
          "proxied": false,
          "comment": "WireGuard endpoint — must NOT be proxied (UDP)"
        }
      ]
    }
  ],
  "a": true,
  "aaaa": false,
  "purgeUnknownRecords": false,
  "ttl": 300
}
```

> `proxied: false` is required for `vpn.` — Cloudflare cannot proxy UDP (WireGuard). For HTTP subdomains (adguard., status.) you may set `proxied: true` to hide your home IP, but this adds Cloudflare's CDN layer which is unnecessary for a homelab.

## Getting the Zone ID

In the Cloudflare dashboard → select your domain → the Zone ID is in the right sidebar under "API".

## Environment variables

The config file contains the API token directly. Do not commit the actual `cloudflare.json` to git — only the `.example` version. The `.gitignore` in `examples/domain/` excludes `config/cloudflare-ddns/cloudflare.json`.

## Compose snippet

```yaml
cloudflare-ddns:
  image: timothyjmiller/cloudflare-ddns:latest
  container_name: cloudflare-ddns
  network_mode: host
  environment:
    - TZ=${TZ}
  volumes:
    - ./config/cloudflare-ddns/cloudflare.json:/config/cloudflare.json:ro
  restart: unless-stopped
```

The container reads `/config/cloudflare.json` on every check interval (default 5 minutes).

## What it updates

- `homelab.example.com` → current public IP (root domain)
- `vpn.homelab.example.com` → current public IP (WireGuard endpoint)

HTTP subdomains (`adguard.`, `status.`, etc.) don't need individual DNS records — they're covered by the Caddy wildcard cert and DNS routing. The only records that need to exist in Cloudflare DNS are the ones that point to your home IP.

## CNAME approach (alternative)

Create a single A record for `homelab.example.com` → public IP (updated by ddns), then CNAME all subdomains to it. This way only one A record needs updating. Update only the root in `cloudflare.json`:

```json
"subdomains": [
  {"name": "", "proxied": false},
  {"name": "vpn", "proxied": false}
]
```

Then in Cloudflare DNS: `adguard` CNAME → `homelab.example.com`, `status` CNAME → `homelab.example.com`, etc. Caddy handles the routing by hostname — DNS just needs to point to the right IP.
