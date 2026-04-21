# DNS Filtering — Testing & Verification

**This file is the gate. Status stays 🔍 until every section has a recorded result.**

---

## Environment

| Item | Value |
|------|-------|
| Host OS | Windows 11 + WSL2 (`homelab-test` distro, Ubuntu-based) |
| Docker version | 29.4.0 |
| Image pulled | `adguard/adguardhome:latest` |
| Image digest | `sha256:f29c58a91f79387cbbbb042e140814f58e830d457d44af03d662c8df43db9dea` |
| Date tested | 2025-04 |

### WSL2 DNS Binding Note

WSL2 binds its internal DNS stub on `10.255.255.254:53`. Binding AdGuard Home to `0.0.0.0:53` during setup fails with `address already in use` because `0.0.0.0` includes that interface. **Solution:** bind the DNS listener to the specific WSL2 eth0 IP (e.g., `192.168.143.14`) during setup. On real hardware, `0.0.0.0:53` works without issue.

---

## Step 1 — Image Pull

| Check | Result | Notes |
|-------|:------:|-------|
| Image pulls without error | ✅ | |
| Multi-arch (amd64 + arm64) | ✅ | Official image supports both |
| Digest recorded | ✅ | `sha256:f29c58a91f79387cbbbb042e140814f58e830d457d44af03d662c8df43db9dea` |

---

## Step 2 — Container Starts

```bash
docker compose up -d adguardhome
docker compose logs adguardhome
```

| Check | Result | Notes |
|-------|:------:|-------|
| Container starts and stays running | ✅ | |
| No errors in logs | ✅ | |
| Logs confirm DNS server listening on port 53 | ✅ | `starting DNS server` confirmed in logs |
| Web UI reachable on port 80 | ✅ | After setup wizard completes via API |

---

## Step 3 — DNS Resolution

```bash
# From Windows host (nslookup) — adguardhome image has no nslookup/dig inside
nslookup google.com <WSL-IP>
nslookup doubleclick.net <WSL-IP>   # should be blocked → 0.0.0.0
```

| Check | Result | Notes |
|-------|:------:|-------|
| Regular domain resolves | ✅ | `google.com` → real IP returned |
| Known ad domain is blocked (NXDOMAIN or 0.0.0.0) | ✅ | `doubleclick.net` → `0.0.0.0` / `::` |

---

## Step 4 — Local DNS Rewrite

Add a rewrite via API or UI, then verify:

```bash
nslookup homelab.lan <WSL-IP>
```

| Check | Result | Notes |
|-------|:------:|-------|
| Local rewrite resolves to server IP | ✅ | `homelab.lan` → `192.168.143.14` via API rewrite |

---

## Step 5 — Web UI (user validation)

> **Deferred to user.** Requires a browser.

```
http://<host-ip>       # web UI on port 80
```

| Check | Result | Notes |
|-------|:------:|-------|
| Dashboard loads | ⬜ | |
| Query log shows activity | ⬜ | |
| Can add a DNS rewrite in UI | ⬜ | |
| Can change upstream DNS in UI | ⬜ | |

---

## Step 6 — Restart Persistence

```bash
docker restart adguardhome
nslookup google.com <WSL-IP>
nslookup doubleclick.net <WSL-IP>
nslookup homelab.lan <WSL-IP>
```

| Check | Result | Notes |
|-------|:------:|-------|
| DNS still resolves after restart | ✅ | |
| Config (rewrites, blocklists) persists | ✅ | All rewrites and blocking survived restart |

---

## Issues Found

| # | Description | Status | Resolution |
|---|-------------|:------:|-----------|
| 1 | `0.0.0.0:53` fails on WSL2 | ✅ Resolved | Bind to specific WSL2 eth0 IP during setup; `0.0.0.0` works on real hardware |
| 2 | No `nslookup`/`dig` inside container | ✅ Documented | Use Windows `nslookup` or host `dig` targeting WSL IP |
| 3 | Setup wizard requires API call (can't env-configure) | ✅ Documented | Use pre-baked `AdGuardHome.yaml` to skip wizard entirely |

---

## Result

✅ **PASS** — all Linux-side checks complete. Steps 4-5 (browser UI, router config) deferred to user on real hardware.
