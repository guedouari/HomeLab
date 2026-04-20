# Nextcloud — Overview

## Role

Nextcloud replaces Google/Apple cloud dependencies for file sync, contacts, and calendar. It is the primary Layer 3 service.

| Cloud service | Nextcloud replacement |
|--------------|----------------------|
| Google Drive / iCloud Drive | Nextcloud Files |
| Google Contacts / iCloud Contacts | Nextcloud Contacts (built-in app) |
| Google Calendar / iCloud Calendar | Nextcloud Calendar (built-in app) |
| Google Keep / Apple Notes | Nextcloud Notes app |
| Google Photos (basic) | Nextcloud Photos app |

## Chosen stack

| Container | Image | Purpose |
|-----------|-------|---------|
| `nextcloud` | `nextcloud:fpm-alpine` (993 MB) | PHP-FPM application server |
| `caddy` | custom build | Reverse proxy + TLS + FPM frontend + static files |

Caddy's `php_fastcgi` directive talks directly to FPM at `localhost:9000` and serves static assets from the shared `nextcloud-data` volume. No nginx sidecar needed — one fewer container.

## Setup wizard bypass

Nextcloud auto-installs on first start when the following environment variables are set:
- `NEXTCLOUD_ADMIN_USER` / `NEXTCLOUD_ADMIN_PASSWORD`
- `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `NEXTCLOUD_TRUSTED_DOMAINS`

No web wizard interaction required. Aligned with the "file config over wizard" principle.

## See also

- [candidates.md](candidates.md) — FPM vs Apache
- [configuration.md](configuration.md) — environment variables, Caddy fastcgi config
- [testing.md](testing.md) — test results
- [horizon.md](horizon.md) — ONLYOFFICE, Talk, backup, Nextcloud AIO
