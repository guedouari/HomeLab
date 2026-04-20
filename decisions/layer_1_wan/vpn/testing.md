# WireGuard — Test Results

All tests run on WSL2 (kernel 6.6.87.2-microsoft-standard-WSL2). WireGuard IS supported — the Microsoft WSL2 kernel includes the WireGuard module since kernel 5.6.

## Pull

```
docker pull linuxserver/wireguard:latest
# Digest: sha256:8e505886ba5da6788f1b9dfc62a25e2f2c3a96e64e6528ef7278d7e1d6649bd2
# Status: Downloaded newer image for linuxserver/wireguard:latest
```

Image size: **113 MB** (amd64 pull; ARM64 manifest confirmed).

## Container start — config generation

```yaml
environment:
  SERVERURL: "192.168.1.10"
  SERVERPORT: "51820"
  PEERS: "phone,laptop"
  PEERDNS: "192.168.1.10"
  INTERNAL_SUBNET: "10.13.13.0"
  LOG_CONFS: "true"
```

**Result:** Container started. Generated:

```
/config/wg_confs/wg0.conf       ← server config
/config/server/                  ← server key pair
/config/peer_phone/              ← phone peer config + QR PNG
/config/peer_laptop/             ← laptop peer config + QR PNG
```

## WireGuard interface activation

From container logs:
```
**** Found WG conf /config/wg_confs/wg0.conf, adding to list ****
**** Activating tunnel /config/wg_confs/wg0.conf ****
[#] ip link add dev wg0 type wireguard
[#] wg setconf wg0 /dev/fd/63
[#] ip -4 address add 10.13.13.1 dev wg0
[#] ip link set mtu 1420 up dev wg0
[#] ip -4 route add 10.13.13.3/32 dev wg0
[#] ip -4 route add 10.13.13.2/32 dev wg0
[#] iptables -A FORWARD -i wg0 -j ACCEPT; ...
**** All tunnels are now active ****
```

✅ WireGuard interface `wg0` came up, routes set, iptables rules applied.

## wg0.conf structure (redacted)

```ini
[Interface]
Address    = 10.13.13.1
ListenPort = 51820
PostUp     = iptables -A FORWARD -i %i -j ACCEPT; ...
PostDown   = iptables -D FORWARD -i %i -j ACCEPT; ...

[Peer]
# peer_phone
PublicKey  = Q9e+s136gSPTJtlT6XCZQOXiensJc1DYjBbhxtltdhg=
AllowedIPs = 10.13.13.2/32

[Peer]
# peer_laptop
PublicKey  = oR4UqUglDLB0by1Jz52bmG2NSttQSlwhNpenEOPjakA=
AllowedIPs = 10.13.13.3/32
```

## QR codes

QR code PNGs written to `/config/peer_<name>/peer_<name>.png`. Also printed to container logs (ASCII art) when `LOG_CONFS=true`. Scannable directly with the WireGuard mobile app.

## Restart persistence

```
docker restart wg-test
# Status: running | Restarts: 0
```

✅ Container restarted cleanly. Existing keys and peer configs preserved (not regenerated). WireGuard interface re-activated from existing `wg0.conf`.

## End-to-end peer connection

> Requires router port-forward (UDP 51820 → server LAN IP). Test on real hardware by:
> 1. Copying `peer_<name>.conf` to client or scanning QR code with WireGuard app
> 2. Activating the tunnel on the client
> 3. Pinging `10.13.13.1` (server VPN IP)
> 4. Accessing `192.168.1.x` services through the tunnel
> 5. Browsing — should be filtered by AdGuard Home at `PEERDNS` address

Cannot be tested in WSL2 without a real internet connection and router access.
