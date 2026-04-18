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
| `nextcloud-nginx` | `nginx:alpine` (59 MB) | HTTP frontend + static file serving |

Total: **1052 MB** vs `nextcloud:apache` at 1390 MB — 338 MB lighter.

The two-container approach is necessary for FPM: nginx handles static assets directly from the shared volume and proxies only PHP requests to FPM.

## Setup wizard bypass

Nextcloud auto-installs on first start when the following environment variables are set:
- `NEXTCLOUD_ADMIN_USER` / `NEXTCLOUD_ADMIN_PASSWORD`
- `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `REDIS_HOST`
- `NEXTCLOUD_TRUSTED_DOMAINS`

No web wizard interaction required. Aligned with the "file config over wizard" principle.

## See also

- [candidates.md](candidates.md) — FPM vs Apache
- [configuration.md](configuration.md) — environment variables, nginx config
- [testing.md](testing.md) — test results
- [horizon.md](horizon.md) — ONLYOFFICE, Talk, backup, Nextcloud AIO
