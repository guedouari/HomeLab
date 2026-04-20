# dynDNS — Role

Keeps the public Cloudflare DNS record for `homelab.example.com` (and `vpn.homelab.example.com`) pointing at the current home public IP.

Residential internet connections typically have dynamic IPs that change when the router reconnects. Without dynDNS, the Cloudflare DNS record would become stale after an IP change and the domain would stop resolving.

## How it works

1. Container starts and reads `/config/cloudflare.json`
2. Every 5 minutes: fetches current public IP (via `api.ipify.org` or similar)
3. Compares to the IP currently in Cloudflare DNS
4. If different: updates the A record via Cloudflare API
5. If same: no API call made

## See also

- [candidates.md](candidates.md) — image comparison
- [configuration.md](configuration.md) — config file and setup
- [testing.md](testing.md) — test results
