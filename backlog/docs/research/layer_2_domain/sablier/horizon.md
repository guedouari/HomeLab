# Sablier — Horizon

## Multiple groups

A Sablier "group" maps to one or more Docker containers. You can group containers that need to start together:

```yaml
# In docker-compose.yml for a service with a companion:
nextcloud:
  labels:
    - sablier.group=nextcloud
nextcloud-cron:
  labels:
    - sablier.group=nextcloud
```

Both containers start when the `nextcloud` group is requested.

## Theme customisation

The waiting page theme can be customised. Three built-in themes: `default`, `hacker-terminal`, `ghost`. Custom themes can be mounted as HTML files — see Sablier docs.

## Blocking mode (no waiting page)

Instead of showing a waiting page, Sablier can block the request until the service is up (useful for API clients that don't render HTML):

```caddy
sablier {
  group myservice
  session_duration 1h
  blocking {
    timeout 30s
  }
}
```

The request holds until the container is healthy or timeout is reached.

## Traefik alternative

If switching to Traefik as reverse proxy, Sablier has a native Traefik middleware plugin. The container and concept are identical — only the integration syntax changes.
