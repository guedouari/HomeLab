# Layer 0 LAN — DNS Filtering

## Role

DNS filtering serves three purposes across layers:
1. **Ad and tracker blocking** — network-wide, no per-device configuration needed (Layer 0)
2. **Local DNS records** — resolves internal service names to the server IP on the LAN (Layer 0)
3. **Remote DNS via VPN** — when Layer 1 VPN is active, remote devices can use the same DNS server, getting both ad blocking and local name resolution away from home (Layer 1)

---

## How Devices Get the DNS Server (Router Configuration)

The standard approach is to configure the DNS server at the **router level**, so all DHCP clients receive it automatically — no per-device setup required.

### Steps (router DHCP settings)
1. Set **Primary DNS** to the server's static LAN IP (e.g., `192.168.1.10`)
2. Leave **Secondary DNS** empty, or set it to a public fallback (e.g., `1.1.1.1`)
   - A fallback means devices bypass the filter if the server is down — acceptable tradeoff for resilience
   - No fallback means DNS fails completely if the server is down — stricter but more fragile

### Devices that ignore router DNS
Some devices (smart TVs, certain Android apps, game consoles) hardcode public DNS servers (e.g., `8.8.8.8`) and ignore DHCP-provided DNS. The only reliable counter-measure is a firewall rule that intercepts and redirects all outbound port 53 traffic to the local DNS server. This is an advanced option and out of scope for Layer 0.

### VPN (Layer 1 preview)
When a WireGuard peer is configured, its config includes a `DNS` field. Setting it to the server's LAN IP means remote devices automatically use the same DNS server — identical ad blocking and local name resolution whether at home or away. No additional DNS setup is needed at Layer 1 beyond setting this field.

---

## Candidates

Technitium is dropped from consideration — it is significantly more complex to operate without meaningful benefit for this use case.

### Pi-hole vs AdGuard Home

> **Image verification** — before finalising any service choice, confirm the Docker image exists and document the exact registry path. Pull the image or check the source registry directly; do not rely on documentation that has not been tested.

| Feature | Pi-hole | AdGuard Home |
|---------|---------|--------------|
| Verified Docker image | `pihole/pihole` (Docker Hub) | `adguard/adguardhome` (Docker Hub) |
| linuxserver image | ❌ none | ❌ none (`adguardhome-sync` exists but is for config sync only) |
| Local DNS records / rewrites | ✅ (custom DNS entries) | ✅ (DNS rewrites, cleaner UI) |
| Ad/tracker blocking | ✅ mature, huge blocklist community | ✅ good, growing ecosystem |
| Upstream DoH / DoT support | ❌ requires cloudflared sidecar | ✅ built-in |
| Per-client settings | Via groups (more steps) | Per-client directly (simpler) |
| DHCP server | ✅ available | ✅ more prominent |
| Web UI | Good, established | Modern, cleaner |
| Active development | Mature / stable | Very active |
| ARM64 support | ✅ | ✅ |
| VPN DNS push (Layer 1) | ✅ same for both — set server IP in WireGuard peer config | ✅ |
| Docker networking complexity | Same for both | Same for both |

### Key differentiator: upstream DNS encryption

Pi-hole queries upstream DNS in plaintext by default. Encrypting upstream queries (DoH/DoT) requires running a separate `cloudflared` sidecar container. AdGuard Home handles this natively — select an encrypted upstream in the UI.

For a home lab this is a secondary concern (ISP can see traffic regardless), but it is relevant if privacy from the upstream resolver matters.

### Key differentiator: per-client rules

AdGuard Home allows applying different blocklists or settings per client device directly in the UI. Pi-hole achieves this through "groups" which requires more steps. For a single-household setup the difference is minor.

### Summary

Both are strong, well-maintained choices with linuxserver images. **AdGuard Home has a slight edge** for new deployments: built-in DoH/DoT upstream, cleaner per-client controls, and a more modern UI. Pi-hole has a larger community and more mature blocklist ecosystem which may matter for troubleshooting.

---

## Docker Networking

DNS requires port 53 (UDP + TCP). This creates a Docker networking challenge:

| Mode | Pros | Cons |
|------|------|------|
| **Host networking** | Simplest; port 53 works immediately | No network isolation; exposes all container ports on host |
| **macvlan** | Container gets its own LAN IP; cleanest DNS behavior | Requires router/switch to support it; host cannot directly reach container |
| **Bridge + port mapping** | Isolated | Port 53 conflicts with `systemd-resolved` on many Linux hosts; requires extra steps to free port 53 |

On most Linux hosts, `systemd-resolved` occupies port 53 on `127.0.0.53`. It must be disabled or redirected before a DNS container can bind to that port in bridge mode.

**Recommended starting point**: host networking for simplicity, revisit if isolation becomes a requirement.

---

## Constraints

- Must run as a Docker container (official vendor image preferred; linuxserver image if available)
- Must support local DNS record overrides / rewrites
- Must serve all device types in [device-support-matrix.md](../device-support-matrix.md)
- Must be reachable at the server's static LAN IP on port 53

---

## Open Decisions

1. **Service choice**: Pi-hole vs AdGuard Home
2. **Docker networking mode**: host (recommended starting point) vs macvlan vs bridge
3. **Secondary DNS fallback on router**: resilience (with fallback) vs strict filtering (no fallback)
4. **Upstream DNS provider**: e.g., Cloudflare (`1.1.1.1`), Quad9 (`9.9.9.9`), or encrypted DoH/DoT endpoint

## Status

**Decided: AdGuard Home** — image: `adguard/adguardhome` (Docker Hub)

Reasons:
- Built-in DoH/DoT upstream encryption (no cloudflared sidecar needed)
- Cleaner per-client controls without group management overhead
- Modern UI with active development
- Official vendor image verified: `adguard/adguardhome`
- Neither candidate has a linuxserver image; constraint removed
- VPN integration at Layer 1 is identical to Pi-hole — no re-evaluation needed

Docker networking mode and upstream DNS provider remain open until implementation.
