# DNS Filtering — Decision Index

## Role

Provide three capabilities from a single container:
1. **Ad and tracker blocking** — network-wide, no per-device configuration
2. **Local DNS records** — internal service names resolve to the server IP on the LAN
3. **Remote DNS via VPN** — at Layer 1, WireGuard peers point to this server and get both ad blocking and local names away from home

Configured once at the router (DHCP primary DNS = server IP) — no per-device setup.

---

## Status

✅ **Verified** — `adguard/adguardhome` tested and passing. See [testing.md](testing.md) for results.

**Selected image:** `adguard/adguardhome:latest` (digest `sha256:f29c58a91f79387cbbbb042e140814f58e830d457d44af03d662c8df43db9dea`)

---

## Sections

| File | Contents |
|------|----------|
| [candidates.md](candidates.md) | Image candidates, verification status |
| [networking.md](networking.md) | Docker networking modes, port 53 constraints |
| [configuration.md](configuration.md) | Upstream DNS, blocklists, local rewrites, env vars |
| [testing.md](testing.md) | Verification checklist and results — gate for finalising status |
| [horizon.md](horizon.md) | Out-of-scope ideas: DoH server, DoT, split-horizon, DHCP |

---

## Constraints

- Must serve port 53 (UDP + TCP) to the LAN
- Must support local DNS rewrites (internal service names)
- Must be configurable via a pre-supplied config file (skip setup wizard, reproducible)
- ARM64 image required (Raspberry Pi target)
- No per-device configuration required — router DHCP handles distribution

---

## Router Setup (one-time)

Set **Primary DNS** in router DHCP settings to the server's static LAN IP.  
Leave Secondary DNS empty (strict) or set to `1.1.1.1` (resilience — devices bypass filtering if server is down).

---

## Horizon

Out-of-scope ideas captured during discussion → [horizon.md](horizon.md)
