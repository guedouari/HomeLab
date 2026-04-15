# Layer 0 LAN — Prerequisites

This file lists the assumptions and prerequisites that must be true before any Layer 0 LAN service is deployed.

> A proper step-by-step prerequisites setup guide will be created later. This file captures the assumptions so they are explicit and not hidden.

---

## Assumed True

### 1. Static Internal IPs

All server machines on the LAN are assigned a **static internal IP address**.

This can be achieved either by:
- DHCP reservation on the router (preferred — no config on the server itself)
- Statically configured network interface on the server

Without a stable IP, DNS records, service endpoints, and inter-container routing will break unpredictably.

### 2. Docker Installed and Operational

**Docker Engine** and **Docker Compose** are installed and working on the server machine.

This is a finalized platform decision (see [platform-choice.md](../platform-choice.md)). All Layer 0 services are deployed as Docker containers.

---

## Not Assumed (Out of Scope for Layer 0)

- VPN or any remote access configuration — belongs to Layer 1
- Public domain or DNS — belongs to Layer 1
- TLS certificates — belongs to Layer 1
