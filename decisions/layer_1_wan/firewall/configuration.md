# Firewall Configuration Reference — Layer 1 WAN

## Docker Compose service

```yaml
crowdsec:
  image: crowdsecurity/crowdsec:latest
  container_name: crowdsec
  network_mode: host
  cap_add:
    - NET_ADMIN      # iptables access for future built-in bouncer mode
  environment:
    - TZ=${TZ}
    - COLLECTIONS=crowdsecurity/linux crowdsecurity/sshd crowdsecurity/iptables
    - GID=1000
  volumes:
    - ./config/crowdsec/acquis.yaml:/etc/crowdsec/acquis.yaml:ro
    - ./config/crowdsec/config.yaml.local:/etc/crowdsec/config.yaml.local:ro
    - ./data/crowdsec:/var/lib/crowdsec/data
  restart: unless-stopped
```

## acquis.yaml — log sources

```yaml
# System syslog (SSH, sudo, kernel iptables LOG)
filenames:
  - /var/log/syslog
  - /var/log/kern.log
  - /var/log/auth.log
labels:
  type: syslog
---
# Docker container logs (WireGuard, AdGuard, Caddy, etc.)
source: docker
container_name_regexp: ".*"
labels:
  type: docker
```

## config.yaml.local — LAPI port override

```yaml
# Move LAPI off 8080 (conflicts with Gatus)
api:
  server:
    listen_uri: 0.0.0.0:8090
```

## Static iptables baseline (setup-firewall.sh)

Minimal rules applied ONCE on the host. These survive reboots if persisted
with `iptables-save`/`iptables-restore` (or `ufw` on Ubuntu).

```bash
# Accept established/related (stateful)
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

# Accept loopback
iptables -A INPUT -i lo -j ACCEPT

# Accept LAN (adjust subnet to your LAN)
iptables -A INPUT -s 192.168.1.0/24 -j ACCEPT

# WireGuard VPN
iptables -A INPUT -p udp --dport 51820 -j ACCEPT

# HTTP/HTTPS (Layer 2+ only — remove if not running Caddy)
iptables -A INPUT -p tcp --dport 80  -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# SSH (optional — restrict to LAN if exposed only locally)
iptables -A INPUT -p tcp --dport 22 -s 192.168.1.0/24 -j ACCEPT

# Log and drop everything else
iptables -A INPUT -j LOG --log-prefix "CS_FIREWALL_DROP " --log-level 7
iptables -A INPUT -j DROP
```

The `CS_FIREWALL_DROP` log prefix feeds into CrowdSec's iptables scenario:
CrowdSec reads kern.log, recognises port-scan patterns, and bans the source.

## Optional: host-side bouncer (automatic banning)

Install once on the server OS to enable automatic IP banning:

```bash
# Debian / Ubuntu
curl -s https://packagecloud.io/install/repositories/crowdsec/crowdsec/script.deb.sh | bash
apt install crowdsec-firewall-bouncer-iptables

# Configure bouncer to talk to CrowdSec container LAPI
# /etc/crowdsec/bouncers/crowdsec-firewall-bouncer.yaml
api_url: http://127.0.0.1:8090
api_key: <generate with: docker exec crowdsec cscli bouncers add firewall-bouncer>
```

After this, CrowdSec decisions → iptables bans happen automatically without
any manual intervention.

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `COLLECTIONS` | (none) | Space-separated collections to install on first start |
| `GID` | 0 (root) | Run as this group (set to match your data dir ownership) |
| `TZ` | UTC | Timezone for log timestamps |

## Ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 8090 | TCP | CrowdSec Local API (internal, LAN-only) |
