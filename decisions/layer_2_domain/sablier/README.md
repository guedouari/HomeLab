# Sablier — On-Demand Containers

## Role

Sablier stops idle services and starts them on the first incoming request. When a user navigates to `myservice.homelab.example.com` and the service is stopped, Sablier:

1. Shows a loading/waiting page
2. Starts the Docker container
3. Waits until it's healthy
4. Redirects the user to the now-running service

After a configurable idle timeout (e.g., 1 hour with no requests), Sablier stops the container again.

This is critical for the Steam Machine hardware where RAM and CPU are shared with games. Services that aren't in active use shouldn't consume resources.

## Chosen image

**`acouvreur/sablier:latest`** — 47 MB, ARM64, official image.

| Property | Value |
|----------|-------|
| Image | `acouvreur/sablier:latest` |
| ARM64 | ✅ |
| Config | Environment variables + Caddy plugin directives |
| Docker socket | Required (to start/stop containers) |
| API port | `10000` |

## Integration with Caddy

Sablier integrates via the Caddy plugin (`github.com/acouvreur/sablier/plugins/caddy`). The plugin is baked into the custom Caddy build. No separate proxy configuration is needed.

In the Caddyfile, wrap a service's `reverse_proxy` with a `sablier` block:

```caddy
@myservice host myservice.{$DOMAIN}
handle @myservice {
  sablier {
    group myservice
    session_duration 1h
    dynamic {
      display_name "My Service"
      theme hacker-terminal
    }
  }
  reverse_proxy localhost:<port>
}
```

## Which services should use Sablier

| Service | Always on? | Use Sablier? |
|---------|-----------|--------------|
| AdGuard Home | Yes — DNS filtering must always work | ❌ |
| Gatus | Yes — monitoring should be always up | ❌ |
| WireGuard | Yes — VPN must be always reachable | ❌ |
| Nextcloud | On demand | ✅ |
| Any Layer 3 service | On demand | ✅ |

## See also

- [candidates.md](candidates.md)
- [configuration.md](configuration.md)
- [testing.md](testing.md)
