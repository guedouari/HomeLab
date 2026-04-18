# Layer 1 — WAN example

This folder adds WireGuard VPN to the Layer 0 stack. It is a complete, self-contained deployment — run this instead of `examples/lan/` when you want remote access.

## What's included

| Service | Image | Purpose |
|---------|-------|---------|
| Samba | `ghcr.io/servercontainers/samba` | LAN file sharing |
| AdGuard Home | `adguard/adguardhome` | DNS filtering |
| Gatus | `twinproduction/gatus` | Health dashboard |
| **WireGuard** | `linuxserver/wireguard` | **VPN — Layer 1** |

## Pre-flight

### 1. Router port-forward (required)

Forward **UDP port 51820** (or `WIREGUARD_PORT`) on your router to the server's LAN IP. This is the only port that needs to be open to the internet at Layer 1.

### 2. Copy config files from Layer 0

```bash
cp -r ../lan/config ./config
```

WireGuard generates its own config on first start — no pre-baked config needed.

### 3. Create data directories

```bash
mkdir -p data/media data/files data/backup data/adguardhome data/gatus data/wireguard
```

### 4. Copy and edit `.env`

```bash
cp .env.example .env
# Edit:
#   SERVER_IP     → your server's static LAN IP
#   WIREGUARD_URL → your public IP or dynDNS hostname
#   WIREGUARD_PEERS → comma-separated names for your devices
```

### 5. Start

```bash
docker compose up -d
```

## First-run: get peer configs

WireGuard generates peer configs on first start. View QR codes in the logs:

```bash
docker logs wireguard 2>&1 | grep -A 20 "PEER 1"
```

Or copy the conf file to a client:

```bash
# File location on the host:
cat data/wireguard/peer_phone/peer_phone.conf
```

Import the `.conf` file into the WireGuard app on the client, or scan the QR code from the logs.

## Adding peers later

Add the new name to `WIREGUARD_PEERS` in `.env` and restart:

```bash
docker compose up -d wireguard
docker logs wireguard 2>&1 | grep -A 20 "peer_newdevice"
```

Existing peers are not affected.

## Verifying the VPN

1. Activate the tunnel on a client device (outside your LAN — use mobile data)
2. Ping the server: `ping 10.13.13.1`
3. Access AdGuard Home: `http://192.168.1.10` (via the tunnel)
4. Access Gatus: `http://192.168.1.10:8080`
5. Access Samba: `\\192.168.1.10\` (via the tunnel)

## Tunnel mode

| Mode | `WIREGUARD_ALLOWEDIPS` | Effect |
|------|----------------------|--------|
| Full tunnel | `0.0.0.0/0` | All client traffic through VPN — ads blocked globally |
| Split tunnel | `192.168.1.0/24` | LAN access only — client internet goes direct |

## AdGuard Home for VPN clients

VPN peers automatically use AdGuard Home for DNS because `PEERDNS` is set to `SERVER_IP`. No additional AdGuard configuration is needed.

To verify: while connected via VPN, `nslookup doubleclick.net` should return `0.0.0.0`.
