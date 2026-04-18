# DNS Filtering — Configuration

## Setup Wizard Problem

AdGuard Home shows a first-run setup wizard that requires interactive browser input before it becomes functional. This breaks reproducible deployment.

**Solution A (used in testing):** call the setup API directly:
```bash
curl -s http://<host>:3000/control/install/configure \
  -H "Content-Type: application/json" \
  -d '{"web":{"ip":"0.0.0.0","port":80},"dns":{"ip":"<LAN-IP>","port":53},"username":"admin","password":"<password>"}'
```
Password must be ≥ 8 characters.

**Solution B (production, recommended):** pre-supply `AdGuardHome.yaml` as a bind-mount. AdGuard Home detects the file on first start and skips the wizard entirely. See `examples/lan/config/adguardhome/AdGuardHome.yaml`.

---

## WSL2 Port 53 Constraint

WSL2 binds an internal DNS stub at `10.255.255.254:53`. Binding AdGuard Home to `0.0.0.0:53` conflicts with this. During setup or in config, set `bind_hosts` to the specific WSL2 eth0 IP. On real Linux hardware `0.0.0.0` works without issue.

---

## Pre-baked Config

The config file lives at `./config/adguardhome/AdGuardHome.yaml` relative to the compose file.

Key sections configured ahead of time:

| Setting | Value | Notes |
|---------|-------|-------|
| HTTP bind | `0.0.0.0:3000` → moves to `0.0.0.0:80` after init | Access on port 80 post-setup |
| DNS bind | `0.0.0.0:53` | Serves all interfaces |
| Upstream DNS | `https://dns.cloudflare.com/dns-query` | DoH — encrypted, no sidecar needed |
| Bootstrap DNS | `1.1.1.1`, `9.9.9.9` | Resolve the upstream DoH hostname |
| Admin user | `admin` / `${ADGUARD_PASSWORD}` (bcrypt) | Set in `.env` |
| Blocklists | AdGuard DNS default + OISD | Good coverage, low false positives |

---

## Volumes

| Host path | Container path | Purpose |
|-----------|---------------|---------|
| `./config/adguardhome` | `/opt/adguardhome/conf` | Config (AdGuardHome.yaml) |
| `./data/adguardhome` | `/opt/adguardhome/work` | Runtime data, query log, statistics |

---

## Local DNS Rewrites

Add in AdGuard Home UI → Filters → DNS rewrites, or pre-populate via config:

```yaml
filtering:
  rewrites:
    - domain: homelab.local
      answer: 192.168.1.10       # server's static LAN IP
    - domain: "*.homelab.local"
      answer: 192.168.1.10
```

---

## Upstream DNS Options

| Upstream | Protocol | Notes |
|----------|----------|-------|
| `https://dns.cloudflare.com/dns-query` | DoH | Default — fast, privacy-respecting |
| `https://dns.quad9.net/dns-query` | DoH | Malware-blocking upstream |
| `tls://1.1.1.1` | DoT | Alternative |
| `1.1.1.1` | Plain UDP | Fallback — unencrypted |

---

## Environment Variables

AdGuard Home does not use env vars for core configuration — everything goes in `AdGuardHome.yaml`. Only `TZ` is set via environment.

---

## Open Questions

1. ~~Local rewrite domain: `.local` suffix can conflict with mDNS on some clients.~~ **Resolved:** use `homelab.lan` (tested ✅).
2. Secondary DNS fallback on router: resilience (with `1.1.1.1`) vs strict (no fallback) — user preference.
