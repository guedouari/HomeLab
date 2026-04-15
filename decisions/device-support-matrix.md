# HomeLab - Device Support Matrix

This document defines the minimum set of devices that HomeLab must support and their expected network behaviors on both LAN and WAN.

This is a general guideline. Individual services will track their own compatibility separately; this file establishes the baseline requirements for the architecture as a whole.

---

## Must-Support Devices

| Device | OS | Network access | Notes |
|--------|----|--------------|----|
| Steam Deck | Linux (SteamOS) | LAN + WAN | Gaming primary use case; must not be bottlenecked by home-server latency when gaming |
| Android Phone | Android | LAN + WAN | Personal productivity, messaging, media consumption |
| iPhone | iOS | LAN + WAN | Personal productivity, messaging, media consumption |
| Windows Laptop | Windows | LAN + WAN | Productivity, file sharing, document editing |
| Linux Laptop | Linux | LAN + WAN | Development, testing, CLI access |
| Dual Windows/Linux Desktop | Windows or Linux (dual boot) | LAN only | Primary workstation, high-performance use, not expected to access services when disconnected |
| Smart TV | Android or WebOS | LAN only | Media playback, dashboard display |

---

## Connectivity Modes

### LAN (Local Area Network)
- Direct connection to the home server on the same network.
- Expected latency: < 10 ms on typical home WiFi, < 2 ms on wired.
- Services are accessed directly at their internal IP or through the home domain.
- Pi-hole DNS overrides apply; local DNS resolution is split-horizon for internal services.

### WAN (Wide Area Network)
- Connection from outside the home, commonly through a VPN or direct internet access.
- Expected latency: variable, typically 20-200 ms depending on ISP and distance.
- Services are accessed through the public domain, routed through the reverse proxy.
- DNS filtering rules can be extended to remote devices through the VPN, making local DNS resolution available remotely too.

### LAN-only devices
- **Dual Windows/Linux Desktop** — high-performance workstation use; remote access not required.
- **Smart TV** — streaming and dashboard use; remote access not meaningful.

### WAN-capable devices
- **Steam Deck** — must work on both LAN and WAN; WAN access is critical for remote play or content access away from home.
- **Android Phone, iPhone** — must work on both LAN and WAN; core use case is mobile access to home services.
- **Windows Laptop, Linux Laptop** — should work on both LAN and WAN for productivity and admin access.

---

## Connectivity Principles

### Standard mode (preferred)
- Devices access services via the same domain name (`service.home.example.com`).
- On LAN, DNS resolves to the internal server IP; connection stays local.
- On WAN, DNS resolves to the public IP; traffic goes through the reverse proxy.

### VPN mode
- Devices may optionally connect through a VPN to join the home network remotely.
- All services remain accessible at the same internal IP (LAN behavior).
- This mode is supported but not the default; it should not be required for basic remote access.

### Design expectation
- Services should be reachable directly (both LAN and WAN) without requiring VPN unless there is a specific security or architectural reason.
- If a service is LAN-only by design (e.g., Samba, Pi-hole admin), document that as an explicit constraint, not a limitation of the device.

---



## Service Compatibility Tracking

This matrix is the baseline; each service decide its own compatibility:

- Some services are LAN-only by design (e.g., Samba, Pi-hole).
- Some services may require WAN routing through a reverse proxy (e.g., Nextcloud, Vaultwarden, Jellyfin).
- Some services may work best on VPN (e.g., internal admin dashboards).


Each service's decision file or implementation notes should explicitly state which devices it supports and under what network conditions.

---

## Key Constraints

1. **No tunneling by default** — devices should not be forced through a VPN just to access a basic service.
2. **Same domain everywhere** — minimize device configuration friction by using identical names on LAN and WAN.
3. **Gaming-friendly** — latency-sensitive applications (Steam Deck while gaming, online multiplayer) must not be exposed to home-server overhead.

5. **Mixed OS support** — all services must assume heterogeneous device OSes; no OS-specific hacks unless unavoidable.

---

## Next Steps

- Each service implementation will reference this matrix when deciding on compatibility.
- Network configuration (DNS, firewall, reverse proxy) will validate against this device set.
- Client onboarding guides will use this matrix to set expectations for each device type.

---

*Last updated: Phase 0 — device support baseline established.*
