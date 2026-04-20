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

**`network_mode: host`** — chosen to enable Avahi mDNS multicast. No port mappings needed or allowed in this mode.

`CAP_NET_ADMIN` required by wsdd2.

**Bridge mode** is no longer used. The previous analysis (bridge + WSDD2 only) was an intermediate step. Host mode gives all three discovery daemons without trade-offs on target hardware.

## WSL2 Note

In Docker on WSL2, host mode shares the WSL2 VM's network namespace (eth0 ~192.168.x.x), not the Windows host network. Consequences:
- Port 445: Windows `LanmanServer` intercepts it — can't reach Samba from same Windows machine
- Avahi + wsdd2: WSL2 is NAT'd — multicast doesn't propagate to the actual LAN
- **On real target hardware (NAS, Pi): all of the above works correctly**
