# Monitoring — Testing & Verification

**This file is the gate. Status stays 🔍 until every section has a recorded result.**

---

## Environment

| Item | Value |
|------|-------|
| Host OS | Windows 11 + WSL2 (`homelab-test` distro, Ubuntu-based) |
| Docker version | 29.4.0 |
| Image pulled | `twinproduction/gatus:latest` |
| Image digest | `sha256:ce650981b5018de1c9e725f1c64015f9051e21e1a4d2bc9eea70dee0d51e7c40` |
| Date tested | 2025-04 |

### WSL2 DNS Note

Gatus DNS checks use the DNS server IP directly (no scheme). AdGuard Home binds to the WSL2 eth0 IP (e.g. `192.168.143.14`), not `127.0.0.1`. Use the eth0 IP in the config on WSL2. On real hardware, use the server's LAN IP or `127.0.0.1`.

---

## Step 1 — Image Pull

| Check | Result | Notes |
|-------|:------:|-------|
| Image pulls without error | ✅ | |
| Multi-arch (amd64 + arm64) | ✅ | Also arm/v7 |
| Digest recorded | ✅ | `sha256:ce650981b5018de1c9e725f1c64015f9051e21e1a4d2bc9eea70dee0d51e7c40` |
| Image size | ✅ | 23.5 MB (vs 562 MB for Uptime Kuma) |

---

## Step 2 — Container Starts (no wizard)

```bash
docker run -d --name gatus \
  --network host \
  -v ./config/gatus/config.yaml:/config/config.yaml:ro \
  twinproduction/gatus:latest
docker logs gatus --tail 5
```

| Check | Result | Notes |
|-------|:------:|-------|
| Container starts without wizard or DB setup | ✅ | Pure YAML config — starts immediately |
| No errors in logs | ✅ | |
| Logs confirm checks running | ✅ | All 3 endpoints logged within 1s of start |

---

## Step 3 — HTTP Check

```bash
curl -s -o /dev/null -w "%{http_code}" http://<WSL-IP>:8080
```

| Check | Result | Notes |
|-------|:------:|-------|
| Dashboard HTTP 200 | ✅ | Confirmed via Windows `Invoke-WebRequest` |

---

## Step 4 — All Monitor Types Pass

```bash
docker logs gatus --tail 10
# Look for: success=true for all 3 endpoints
```

| Check | Result | Notes |
|-------|:------:|-------|
| AdGuard Home HTTP check: success | ✅ | `success=true; duration=1ms` |
| DNS check (AdGuard resolves google.com): success | ✅ | `success=true; duration=472ms` |
| Samba TCP port 445: success | ✅ | `success=true; duration=1ms` |

---

## Step 5 — Web UI (user validation)

> **Deferred to user.** Requires a browser.

```
http://<host-ip>:8080
```

| Check | Result | Notes |
|-------|:------:|-------|
| Dashboard loads showing all monitors | ⬜ | |
| All monitors show green / up | ⬜ | |

---

## Step 6 — Restart Persistence

```bash
docker restart gatus
# Checks resume immediately after restart
docker logs gatus --tail 5
```

| Check | Result | Notes |
|-------|:------:|-------|
| Dashboard still reachable after restart | ✅ | HTTP 200 confirmed after restart |
| Checks resume immediately | ✅ | All 3 endpoints checked within 1s of restart |

---

## Issues Found

| # | Description | Status | Resolution |
|---|-------------|:------:|-----------|
| 1 | DNS check URL must be just the IP (no `udp://` or `dns://` scheme) | ✅ Documented | Use plain IP with `dns:` block |
| 2 | DNS check fails if targeting loopback on WSL2 | ✅ Documented | AdGuard binds to eth0 IP on WSL2; use that IP |

---

## Result

✅ **PASS** — all automated checks complete. Step 5 (browser UI) deferred to user.
