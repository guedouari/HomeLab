# Monitoring — Networking

## Port

Uptime Kuma serves its web UI on **port 3001** by default.

At Layer 0, no reverse proxy is in place. Uptime Kuma is accessed directly at `http://<host-ip>:3001`.

---

## Docker Networking Mode

**Bridge (port mapping)** — `3001:3001`

Uptime Kuma does not need to serve DNS, mDNS, or any multicast protocol. Bridge networking with a single port mapping is sufficient and provides network isolation.

| Mode | Assessment |
|------|-----------|
| **Bridge + port 3001** | ✅ Recommended — simple, isolated, sufficient |
| Host | Unnecessary — no multicast needed; loses isolation |
| macvlan | Overkill for a web UI |

---

## Monitor Connectivity

When Uptime Kuma monitors other services, it makes outbound connections from inside the container. With bridge networking:

- **Same host services in host mode** (Samba, AdGuard Home): reachable via the Docker host's gateway IP (typically `172.17.0.1` or the `host-gateway` alias)
- **LAN services**: reachable via normal network routing
- **Internet services**: reachable via NAT

In Docker Compose, use `extra_hosts: ["host.docker.internal:host-gateway"]` to allow the container to reach host-networked services by name.
