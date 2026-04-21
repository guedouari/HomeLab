# Nextcloud — Candidate Evaluation

## Deployment variants

| Image | Size | Containers | Notes |
|-------|------|-----------|-------|
| `nextcloud:fpm-alpine` | 993 MB | 2 (+ nginx) | Lighter, recommended for production |
| `nextcloud:apache` | 1390 MB | 1 | Convenient but 338 MB heavier |
| `nextcloud:fpm` | ~1200 MB | 2 (+ nginx) | Debian-based FPM, heavier than alpine |
| Nextcloud AIO | ~2 GB+ | Many | All-in-one with bundled DB, Redis, Talk — violates "fewer containers" principle |

## Decision: `nextcloud:fpm-alpine` + `nginx:alpine`

**Why not apache:** 338 MB heavier with no advantage for our use case. Apache's advantage is single-container simplicity, but the nginx config for FPM is standard and minimal.

**Why not Nextcloud AIO:** The All-in-One image bundles PostgreSQL, Redis, Talk, etc. into a single orchestrated setup. We already have PostgreSQL and Redis as shared services. AIO would duplicate them, adding unnecessary weight and losing flexibility.

**Why FPM + nginx:**
- nginx serves static assets (CSS, JS, images) directly from the shared volume — PHP-FPM is only invoked for PHP requests, which is more efficient
- Aligns with "lighter is better"
- nginx + FPM is the Nextcloud-recommended production setup

## Redis

Redis is required for transactional file locking in Nextcloud. Without it, Nextcloud falls back to database locking which is significantly slower under concurrent access. `redis:alpine` (93 MB) is the obvious choice — single-container, no config needed beyond a password.
