# Monitoring — Configuration

## First Run

Uptime Kuma opens a registration page on first start — create an admin username and password. This is a one-time step in the browser.

Unlike AdGuard Home, there is no config-file bypass for the initial admin account. The account is stored in SQLite (`kuma.db`) which persists in the data volume.

---

## Storage

| Host path | Container path | Purpose |
|-----------|---------------|---------|
| `./data/uptime-kuma` | `/app/data` | SQLite database, all monitors, history |

SQLite lives at `/app/data/kuma.db`. Backing up this file preserves all monitors, history, and settings.

---

## Monitor Types

Add monitors via the web UI at `http://<host-ip>:3001`. Common types for this stack:

| Type | Use for |
|------|---------|
| HTTP(s) | AdGuard Home web UI, any HTTP service |
| DNS | Verify AdGuard Home is resolving (query a known domain) |
| TCP Port | Samba port 445, PostgreSQL port 5432 |
| Docker Container | Monitor container status directly (via Docker socket) |
| Ping | Basic host reachability |

---

## Notifications

Layer 0 recommendation: configure **ntfy.sh** (public, free, no self-hosting required):

1. In Uptime Kuma → Settings → Notifications → Add Notification
2. Type: `ntfy`
3. ntfy Server URL: `https://ntfy.sh`
4. Topic: choose a unique private topic name (e.g., `homelab-abc123`)
5. Subscribe on mobile: ntfy app → add server → subscribe to same topic

For Layer 1, run a self-hosted ntfy container and point Uptime Kuma there.

---

## Docker Socket Access (optional)

To enable "Docker Container" monitor type, mount the Docker socket:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock:ro
```

This gives Uptime Kuma read access to container state. Included in the compose example with `:ro` (read-only).

---

## Environment Variables

Uptime Kuma uses very few env vars for core config — most settings are in the SQLite database.

| Variable | Purpose |
|----------|---------|
| `TZ` | Timezone for timestamps in the UI |
| `UPTIME_KUMA_PORT` | Override web UI port (default 3001) — not needed |
