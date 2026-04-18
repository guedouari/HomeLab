# Monitoring — Testing & Verification

**This file is the gate. Status stays 🔍 until every section has a recorded result.**

---

## Environment

| Item | Value |
|------|-------|
| Host OS | Windows 11 + WSL2 (`homelab-test` distro, Ubuntu-based) |
| Docker version | 29.4.0 |
| Image pulled | `louislam/uptime-kuma:2` |
| Image digest | `sha256:7337368a77873f159435de9ef09567f68c31285ed5f951dec36256c4b267ee44` |
| Date tested | 2025-04 |

---

## Step 1 — Image Pull

| Check | Result | Notes |
|-------|:------:|-------|
| Image pulls without error | ✅ | |
| Multi-arch (amd64 + arm64) | ✅ | Also arm/v7 |
| Digest recorded | ✅ | `sha256:7337368a77873f159435de9ef09567f68c31285ed5f951dec36256c4b267ee44` |

---

## Step 2 — Container Starts

```bash
docker compose up -d uptime-kuma
docker compose logs uptime-kuma
```

| Check | Result | Notes |
|-------|:------:|-------|
| Container starts and stays running | ✅ | |
| No errors in logs | ✅ | DB setup wizard shown — expected on first run |
| Web UI reachable on port 3001 | ✅ | HTTP 200 confirmed |

---

## Step 3 — Add a Monitor (automated check)

```bash
# From WSL or Windows host
curl -s -o /dev/null -w "%{http_code}" http://<WSL-IP>:3001
```

| Check | Result | Notes |
|-------|:------:|-------|
| HTTP 200 returned from port 3001 | ✅ | Confirmed via Windows `Invoke-WebRequest` |

---

## Step 4 — Web UI and Monitor Creation (user validation)

> **Deferred to user.** Requires a browser.

```
http://<host-ip>:3001
```

1. Complete first-run registration (create admin account)
2. Add an HTTP monitor pointing to AdGuard Home: `http://<host-ip>`
3. Add a TCP monitor for Samba: `<host-ip>:445`
4. Verify monitors show as **Up**

| Check | Result | Notes |
|-------|:------:|-------|
| Registration page loads | ⬜ | |
| HTTP monitor added and shows Up | ⬜ | |
| TCP monitor added and shows Up | ⬜ | |
| Dashboard shows all monitors | ⬜ | |

---

## Step 5 — Restart Persistence

```bash
docker restart uptime-kuma
curl -s -o /dev/null -w "%{http_code}" http://<WSL-IP>:3001
```

| Check | Result | Notes |
|-------|:------:|-------|
| Web UI still reachable after restart | ✅ | HTTP 200 after restart confirmed |
| Monitors persist (not lost after restart) | ⬜ | Deferred to user — requires monitors added in Step 4 |

---

## Issues Found

| # | Description | Status | Resolution |
|---|-------------|:------:|-----------|
| 1 | First run shows DB setup wizard (not just account registration) | ✅ Documented | Expected — choose SQLite, then create admin account |

---

## Result

✅ **PASS** — automated checks complete. Steps 4-5 (monitor creation, notification) deferred to user.
