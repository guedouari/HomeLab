# Firewall / Intrusion Detection — Layer 1 WAN

## Decision

**CrowdSec** for intrusion detection + community blocklists, combined with
host-side iptables rules for enforcement.

- Image: `crowdsecurity/crowdsec:latest`
- Size: 343 MB (Go binary + embedded collection hub)
- ARM64: ✅

## Architecture

```
Internet ──► iptables (host kernel) ──► WireGuard ──► LAN
                  ▲
                  │ ban decisions
             CrowdSec (container)
                  │ reads
             /var/log/syslog, Docker container logs
```

CrowdSec is **detection** (parses logs, applies scenarios, maintains ban list).
iptables is **enforcement** (kernel drops packets for banned IPs).
The firewall bouncer (`crowdsec-firewall-bouncer`) bridges them — it polls
the CrowdSec Local API and updates iptables automatically.

## What CrowdSec provides

- **Community blocklist**: ~50 000 IPs known bad actors, auto-updated hourly
- **Behavior detection**: port scans, SSH brute force, failed logins
- **iptables integration**: automatic ban via bouncer (or manual iptables script)
- **Zero cost**: FOSS core, Central API community tier is free
- **File config**: `acquis.yaml` defines log sources; no wizard required

## Port

CrowdSec Local API (LAPI) defaults to `:8080` — conflicts with Gatus.
Override via `config.yaml.local`:
```yaml
api:
  server:
    listen_uri: 0.0.0.0:8090
```

## Bouncer options

| Option | Pros | Cons |
|--------|------|------|
| Host `crowdsec-firewall-bouncer` service | Native iptables access, recommended | Requires host install step |
| Manual iptables script | Zero extra installs | Static rules only, no auto-ban |
| Second Docker container with `NET_ADMIN` | Fully containerised | Extra 80 MB image |

**Recommended**: host-side bouncer for production; static iptables script as
baseline for initial setup. Both options are documented.

## Collections enabled

| Collection | What it detects |
|------------|----------------|
| `crowdsecurity/linux` | Syslog, failed sudo, base patterns |
| `crowdsecurity/sshd` | SSH brute force (11 scenarios) |
| `crowdsecurity/iptables` | Port scans via iptables LOG entries |

## Tested

- `crowdsecurity/crowdsec:latest` → v1.7.7, ARM64 ✅
- 10 scenarios loaded, LAPI running on port 8090 ✅
- Community blocklist pull: 0 entries on fresh install (expected) ✅
- Collections download on first start (no manual `cscli` step needed) ✅

## Configuration files

| File | Purpose |
|------|---------|
| `config/crowdsec/acquis.yaml` | Log sources to parse |
| `config/crowdsec/config.yaml.local` | LAPI port override |
| `scripts/setup-firewall.sh` | Static iptables baseline + bouncer install guide |
