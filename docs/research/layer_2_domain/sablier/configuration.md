# Sablier — Configuration

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SABLIER_PROVIDER_NAME` | `docker` | Container provider (docker / swarm / kubernetes) |
| `SABLIER_SERVER_PORT` | `10000` | Sablier API port (accessed by the Caddy plugin) |
| `SABLIER_STORAGE_FILE` | `/data/sablier.json` | State persistence |
| `SABLIER_SESSIONS_DEFAULT_DURATION` | `1m` | Global default session (override per-route in Caddyfile) |

## Compose snippet

```yaml
sablier:
  image: acouvreur/sablier:latest
  container_name: sablier
  network_mode: host
  environment:
    - TZ=${TZ}
    - SABLIER_PROVIDER_NAME=docker
    - SABLIER_SERVER_PORT=10000
    - SABLIER_SESSIONS_DEFAULT_DURATION=1m
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - ./data/sablier:/data
  restart: unless-stopped
```

## Caddyfile integration (per-service)

Add to the `handle` block for any Layer 3 service:

```caddy
@myservice host myservice.{$DOMAIN}
handle @myservice {
  sablier {
    group myservice                   # matches Docker container name
    session_duration 1h               # stop after 1h idle
    dynamic {
      display_name "My Service"       # shown on the waiting page
      theme hacker-terminal           # waiting page theme
      show_details true
      refresh_frequency 5s
    }
  }
  reverse_proxy localhost:8096        # service internal port
}
```

## Important: container must not have `restart: unless-stopped`

Services managed by Sablier must use `restart: "no"` or `restart: on-failure`. If `unless-stopped` is used, Docker will restart the container immediately after Sablier stops it.

```yaml
myservice:
  image: ...
  restart: "no"          # Sablier manages start/stop
```

## Themes

Built-in waiting page themes: `default`, `hacker-terminal`, `ghost`. The theme is shown to the user while the container starts. Pick based on your preference — all are simple static HTML pages.
