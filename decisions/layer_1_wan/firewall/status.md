# Firewall Status — Layer 1 WAN

## Implementation status

| Check | Result |
|-------|--------|
| Image pull | ✅ `crowdsecurity/crowdsec:latest` 343 MB |
| ARM64 | ✅ multi-arch manifest |
| Container starts (no config) | ❌ exits — needs acquis.yaml |
| Container starts (with config) | ✅ v1.7.7, 10 scenarios loaded |
| LAPI reachable | ✅ port 8090 (overridden from 8080) |
| Collections auto-download | ✅ linux, sshd, iptables |
| Community blocklist | ✅ connects to Central API |
| Port conflict resolved | ✅ config.yaml.local → 8090 |
| Decision files | ✅ 6 files created |
| Compose integration | ✅ added to wan/domain/services examples |
| Host firewall script | ✅ scripts/setup-firewall.sh |

## Known limitations

- Bouncer (automatic IP banning) requires a host-side install step — not
  fully containerised. Documented in setup-firewall.sh and configuration.md.
- WireGuard encrypted traffic cannot be inspected at application layer —
  CrowdSec monitors the OS logs (syslog, auth.log) and iptables DROP logs,
  not WireGuard payloads. This is expected and sufficient.
- Community blocklist starts empty on fresh install — fills within 2 hours.

## Next actions

- [ ] Install `crowdsec-firewall-bouncer-iptables` on actual server host
- [ ] Configure bouncer API key via `cscli bouncers add`
- [ ] Add iptables LOG rules to host for port-scan detection
- [ ] Consider `crowdsecurity/caddy` collection at Layer 2 for HTTP attack detection
