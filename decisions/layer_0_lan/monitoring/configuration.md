# Monitoring — Configuration

## Config File

Gatus is entirely driven by a single YAML file mounted at `/config/config.yaml`. No database, no web wizard.

The config lives at `./config/gatus/config.yaml` relative to the compose file.

---

## Example Config (Layer 0 stack)

```yaml
web:
  port: 8080

endpoints:
  - name: AdGuard Home
    url: http://\${SERVER_IP}:80
    interval: 30s
    conditions:
      - '[STATUS] == 200'

  - name: DNS (AdGuard)
    url: '\${SERVER_IP}'        # just the IP — no scheme for DNS checks
    dns:
      query-name: google.com
      query-type: A
    interval: 30s
    conditions:
      - '[DNS_RCODE] == NOERROR'

  - name: Samba (SMB port)
    url: tcp://\${SERVER_IP}:445
    interval: 30s
    conditions:
      - '[CONNECTED] == true'
```

Replace `\${SERVER_IP}` with the server's static LAN IP.

> **WSL2 note:** use the WSL2 eth0 IP (e.g. `192.168.143.14`), not `127.0.0.1`.
> AdGuard Home binds DNS to the specific eth0 IP on WSL2, not loopback.
> On real hardware, `127.0.0.1` or `0.0.0.0` work fine.

---

## Check Types

| Type | URL format | Example |
|------|-----------|---------|
| HTTP | `http://host:port/path` | `http://192.168.1.10:80` |
| TCP | `tcp://host:port` | `tcp://192.168.1.10:445` |
| DNS | Just the DNS server IP (no scheme) + `dns:` block | `url: 192.168.1.10` |
| Ping/ICMP | `icmp://host` | `icmp://192.168.1.10` |

---

## Conditions

| Placeholder | Resolves to |
|-------------|------------|
| `[STATUS]` | HTTP response code |
| `[CONNECTED]` | `true` / `false` for TCP/ICMP |
| `[DNS_RCODE]` | DNS response code (`NOERROR`, `NXDOMAIN`, etc.) |
| `[BODY]` | Response body (supports JSONPath) |
| `[RESPONSE_TIME]` | Duration in ms |

---

## Notifications (optional at Layer 0)

Add an `alerting` block and reference the alert type per endpoint:

```yaml
alerting:
  ntfy:
    url: https://ntfy.sh
    topic: homelab-alerts    # pick a unique private topic

endpoints:
  - name: AdGuard Home
    url: http://192.168.1.10:80
    interval: 30s
    conditions:
      - '[STATUS] == 200'
    alerts:
      - type: ntfy
        failure-threshold: 3
        send-on-resolved: true
```

---

## Volumes

| Host path | Container path | Purpose |
|-----------|---------------|---------|
| `./config/gatus/config.yaml` | `/config/config.yaml` | Full monitoring config |
| `./data/gatus` | `/data` | History / SQLite (optional — mount to persist uptime history) |

History is optional. If not mounted, Gatus starts fresh on restart but still checks services immediately.

---

## Environment Variables

Gatus supports `\${ENV_VAR}` substitution inside `config.yaml`. Useful to keep the server IP out of the committed config:

```yaml
endpoints:
  - name: AdGuard Home
    url: http://\${SERVER_IP}:80
```

Pass via compose:
```yaml
environment:
  - SERVER_IP=192.168.1.10
```
