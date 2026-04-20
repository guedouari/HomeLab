# WireGuard — Horizon

Advanced use cases that are out of scope for Layer 1 but enabled by WireGuard.

## Site-to-site VPN

Connect two home networks so both see each other's LAN. Requires:
- A WireGuard peer on each site that has `AllowedIPs` set to the remote LAN subnet
- Static route or BGP on each router to direct remote-LAN traffic through the WireGuard peer

Example: `AllowedIPs = 192.168.2.0/24` on the peer entry lets the server route traffic to a second home network.

## Road warrior + LAN access (split tunnel)

Default full-tunnel (`AllowedIPs = 0.0.0.0/0`) routes everything through the VPN. For laptop use where you want only LAN access (not to route all internet traffic):
- Set `ALLOWEDIPS = 192.168.1.0/24,10.13.13.0/24`
- Client internet traffic goes direct; LAN + VPN traffic go through the tunnel

## Mobile kill switch

WireGuard mobile apps support a kill switch that blocks all non-VPN traffic. Useful for untrusted networks (airports, hotels). Not a server-side config — client-side only.

## Mesh networking (multiple peers talk to each other)

Standard WireGuard is hub-and-spoke (all traffic through server). For peer-to-peer mesh:
- Tools like **Tailscale** or **Netbird** add a coordination layer on top of WireGuard to handle direct peer-to-peer routing
- Out of scope for homelab — hub-and-spoke is sufficient

## WireGuard as LAN-only VPN (no internet routing)

If the server is on the same LAN as all clients and WAN access is not needed:
- Set `ALLOWEDIPS` to only the server and VPN subnets
- Useful for securely connecting IoT devices or guest devices to specific homelab services without bridging to the LAN

## IPv6 support

linuxserver/wireguard supports IPv6 (`ALLOWEDIPS = ::/0` for full IPv6 tunnel). Requires the host to have an IPv6 address. Not tested in this project.
