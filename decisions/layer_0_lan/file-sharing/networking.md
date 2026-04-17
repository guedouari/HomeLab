# File Sharing — Docker Networking

## Port Requirements

| Port | Protocol | Purpose |
|------|----------|---------|
| 445 | TCP | SMB (primary, modern) |
| 139 | TCP | SMB over NetBIOS (legacy compatibility) |
| 5357 | TCP | WSD (WSDD2 — Windows Network Browser discovery) |
| 3702 | UDP | WSD multicast (WSDD2) |
| 137–138 | UDP | NetBIOS Name Service (legacy, disabled) |
| 5353 | UDP | mDNS/Bonjour (Avahi — macOS/iOS discovery) |

## Networking Mode vs Discovery

| Mode | Share access | Windows discovery (WSDD2) | macOS/iOS discovery (Avahi) | Complexity |
|------|:------------:|:-------------------------:|:---------------------------:|:----------:|
| **Bridge + port mapping** | ✅ | ✅ | ❌ | Low |
| **Host networking** | ✅ | ✅ | ✅ | Low — less isolation |
| **macvlan** | ✅ | ✅ | ✅ | High |

## Discovery Protocol Analysis

Three discovery mechanisms are bundled in `ghcr.io/servercontainers/samba`:

### WSDD2 — Windows Network Browser (WS-Discovery)
Makes the server appear in Windows Explorer → Network. Uses **unicast + limited multicast** on ports 3702/UDP and 5357/TCP. Works cleanly through bridge + port mapping. **Recommended: enable.**

### Avahi — macOS/iOS Bonjour (mDNS/Zeroconf)
Makes the server visible in macOS Finder → Network and in iOS Files app. Uses **multicast UDP on 224.0.0.251:5353**. Docker bridge NAT **cannot relay multicast** — Avahi will only work with `network_mode: host`. If host mode is used, drop all `ports:` entries (not needed). **Deferred: see below.**

### NetBIOS (nmbd)
Legacy Windows broadcast discovery (pre-WS-Discovery). Superseded by WSDD2 on Windows 10+. Keep disabled.

## Decision

**Phase 1 (current):** bridge networking + WSDD2 enabled.
- Windows Network Browser discovery works
- Direct IP access always works for all clients
- macOS/iOS use direct IP or DNS hostname

**Phase 2 (future, optional):** evaluate host networking to add Avahi for macOS/iOS Finder discovery. This is a quality-of-life improvement, not a requirement.

## WSL2 Note

Windows `LanmanServer` occupies port 445 on **all** host interfaces including the WSL2 virtual adapter. This blocks testing Windows-to-WSL2 SMB from the same machine. Not an issue on target hardware (NAS, Pi).

## Ports to map (bridge mode)

```yaml
ports:
  - "139:139"    # SMB legacy
  - "445:445"    # SMB primary
  - "3702:3702/udp"  # WSDD2 discovery
  - "5357:5357"  # WSDD2 discovery
```
