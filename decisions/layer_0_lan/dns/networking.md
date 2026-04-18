# DNS Filtering — Docker Networking

## Port Requirements

| Port | Protocol | Purpose |
|------|----------|---------|
| 53 | UDP + TCP | DNS queries from all LAN devices |
| 3000 | TCP | Initial setup wizard (first boot only) |
| 80 / 443 | TCP | Web UI (after initial setup) |

## The Port 53 Problem

Port 53 is special: most Linux hosts run `systemd-resolved` which occupies port 53 on `127.0.0.53`. This creates a conflict in bridge networking mode.

| Mode | Share access | Port 53 conflict | Complexity |
|------|:------------:|:----------------:|:----------:|
| **Bridge + port mapping** | ✅ | ⚠️ conflicts with systemd-resolved | Low — but needs extra steps to free port 53 |
| **Host networking** | ✅ | ❌ none (container uses host port 53 directly) | Low |
| **macvlan** | ✅ | ❌ none (own LAN IP) | High |

## Decision: Host Networking

`network_mode: host` — same reasoning as Samba, simpler than fighting systemd-resolved.

On the target hardware (NAS running Debian/Ubuntu, Raspberry Pi OS):
- Disable `systemd-resolved` stub listener before starting the container:
  ```bash
  # /etc/systemd/resolved.conf
  [Resolve]
  DNSStubListener=no
  systemctl restart systemd-resolved
  ```
- Or point systemd-resolved upstream to the container (loop risk — avoid).

## WSL2 Note

In WSL2, `systemd-resolved` is typically not running (no systemd by default). Port 53 is usually free on the WSL2 VM's `eth0`. Test with:
```bash
ss -ulnp | grep :53
ss -tlnp | grep :53
```
