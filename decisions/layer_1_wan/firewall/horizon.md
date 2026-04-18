# Firewall Horizon — Layer 1 WAN

## Layer 2 additions

When Caddy is running, add the HTTP collections:

```bash
docker exec crowdsec cscli collections install crowdsecurity/http-generic
docker exec crowdsec cscli collections install crowdsecurity/nginx
docker exec crowdsec cscli collections install crowdsecurity/caddy
```

Update `acquis.yaml` to add Caddy container logs:

```yaml
source: docker
container_name: caddy
labels:
  type: caddy
```

## CrowdSec Console (optional)

CrowdSec offers a free web console at https://app.crowdsec.net for viewing
alerts across multiple instances. Enroll with:

```bash
docker exec crowdsec cscli console enroll <token>
```

No additional container or cost — purely optional visibility upgrade.

## Bouncer alternatives

- `crowdsecurity/cs-nginx-bouncer` — block banned IPs at Caddy/nginx layer
  (Layer 2) rather than iptables — lower overhead, no `NET_ADMIN` cap needed
- `crowdsecurity/cs-blocklist-mirror` — serve a local IP blocklist for AdGuard
  Home to consume as a DNS blocklist — kills two birds with one stone

## Multi-site / mesh

CrowdSec supports sharing decisions across multiple servers. If you run
multiple homes/locations, a single Central API account shares ban decisions
between all nodes automatically.

## Intrusion prevention vs detection

Current setup: **detection only** (CrowdSec) + **static firewall** (iptables baseline).
With bouncer installed: **prevention** (automatic IP banning within minutes of attack).
With cs-nginx-bouncer at Layer 2: **active blocking at HTTP layer** before iptables.
