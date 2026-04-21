# Firewall / IDS Candidates — Layer 1 WAN

## Requirements

- Lightest possible — one container preferred, zero containers ideal
- ARM64 required
- File config (no wizard)
- Works with WireGuard (not application-layer, so must operate at network/kernel level)
- FOSS

## Candidates evaluated

### CrowdSec ✅ Selected

- Image: `crowdsecurity/crowdsec:latest` (343 MB, ARM64 ✅)
- Behavior-based IDS + community IP blocklist
- File config (`acquis.yaml`, `config.yaml.local`)
- Active community with 50k+ blocklisted IPs updated continuously
- Bouncer model: CrowdSec detects, iptables enforces (kernel, no extra container)
- Verified: v1.7.7 starts cleanly, downloads collections on first run

### fail2ban

- Would run on the HOST OS, not in Docker — breaks the "everything in compose" model
- Parses logs directly, no community blocklist
- No ARM64 Docker image maintained
- Rejected: harder to manage, no blocklist benefit

### Crowdsec + cs-firewall-bouncer (two containers)

- `crowdsecurity/cs-firewall-bouncer` exists as Docker image
- Adds NET_ADMIN cap, reads CrowdSec LAPI, applies iptables rules automatically
- ~80 MB additional
- Not selected as default: host-side bouncer is simpler and has direct iptables access
- Documented in setup-firewall.sh as an optional upgrade

### UFW / nftables (host only)

- Kernel-level firewall, zero Docker overhead
- No behavior detection, no community blocklist
- Appropriate as a **baseline** (static rules), not a replacement for detection
- Documented as static rules in setup-firewall.sh

### Wazuh

- Full SIEM — 1.5 GB+, overkill for a homelab WAN layer
- Rejected: too heavy

### Snort / Suricata

- Deep packet inspection, high CPU/RAM usage
- ARM64 support inconsistent
- Rejected: too heavy for homelab
