# Nextcloud — Configuration

## Nextcloud environment variables

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXTCLOUD_ADMIN_USER` | `admin` | Admin username (auto-installs on first start) |
| `NEXTCLOUD_ADMIN_PASSWORD` | `...` | Admin password |
| `NEXTCLOUD_TRUSTED_DOMAINS` | `nextcloud.homelab.example.com localhost` | Space-separated trusted domains |
| `NEXTCLOUD_DATA_DIR` | `/var/www/html/data` | User data directory |
| `POSTGRES_HOST` | `localhost` | PostgreSQL host (localhost since both in host mode) |
| `POSTGRES_DB` | `nextcloud` | Nextcloud database name |
| `POSTGRES_USER` | `nextcloud_user` | Database user |
| `POSTGRES_PASSWORD` | `...` | Database password |
| `PHP_UPLOAD_LIMIT` | `512M` | Max upload size |
| `PHP_MEMORY_LIMIT` | `512M` | PHP memory limit |
| `OVERWRITEPROTOCOL` | `https` | Force HTTPS in generated URLs (behind reverse proxy) |
| `OVERWRITECLIURL` | `https://nextcloud.homelab.example.com` | CLI URL for cron jobs |

## Caddy config (`config/caddy/Caddyfile`)

Caddy serves as both the reverse proxy/TLS terminator and the Nextcloud FPM HTTP frontend. It mounts the `nextcloud-data` volume at `/var/www/html` to serve static assets directly.

```caddy
@nextcloud host nextcloud.{$DOMAIN}
handle @nextcloud {
  root * /var/www/html

  redir /.well-known/carddav /remote.php/dav 301
  redir /.well-known/caldav  /remote.php/dav 301

  php_fastcgi localhost:9000 {
    env HTTPS on
    env HTTP_HTTPS on
  }

  file_server
}
```

No Sablier — Nextcloud must always be running for CalDAV/CardDAV sync to work reliably.

## Shared volume

`nextcloud:fpm-alpine` writes app files to `/var/www/html`. Caddy reads from the same path (mounted read-only) to serve static assets directly. Both share a named Docker volume `nextcloud-data`.

## Cron (background jobs)

Nextcloud requires periodic background jobs (file indexing, notifications, etc.). The recommended method is a system cron job on the host:

```bash
# Add to /etc/cron.d/nextcloud (run every 5 minutes):
*/5 * * * * root docker exec --user www-data nextcloud php -f /var/www/html/cron.php
```

Or use Nextcloud's built-in `webcron` feature (less reliable) — configure in Admin → Basic settings → Background jobs.
