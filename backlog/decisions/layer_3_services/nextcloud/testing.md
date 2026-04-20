# Nextcloud — Test Results

## Images pulled

```
docker pull nextcloud:fpm-alpine   → 993 MB, ARM64 ✅
docker pull nginx:alpine           → 59 MB,  ARM64 ✅
```

## PostgreSQL and Redis pre-requisites

Both tested independently — see `database/testing.md`.

## Nextcloud auto-install (wizard bypass)

Nextcloud `fpm-alpine` was started with full env var configuration:

```bash
docker run -d --name nc-app --network host \
  -e POSTGRES_HOST=localhost \
  -e POSTGRES_DB=nextcloud \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=ncdbpass \
  -e NEXTCLOUD_ADMIN_USER=admin \
  -e NEXTCLOUD_ADMIN_PASSWORD=homelab123 \
  -e NEXTCLOUD_TRUSTED_DOMAINS=localhost \
  -e REDIS_HOST=localhost \
  -e REDIS_HOST_PASSWORD=ncredispass \
  -e PHP_UPLOAD_LIMIT=512M \
  -e PHP_MEMORY_LIMIT=512M \
  nextcloud:fpm-alpine
```

After ~60 seconds:

```bash
docker exec nc-app ls /var/www/html/config/config.php
# /var/www/html/config/config.php   ← installation complete
```

✅ `config.php` created — Nextcloud installed successfully without the web wizard.

The logs showed `Retrying install...` once — this is expected when PostgreSQL is still initialising. Nextcloud retries automatically.

## config.php auto-configured

Key entries auto-configured by env vars:
- `dbtype = pgsql`
- `dbhost = localhost`
- `trusted_domains = [localhost]`
- `redis` connection block (host, port, password)
- `overwrite.cli.url`

## nginx config validation

The nginx config for Nextcloud FPM proxying was validated:

```bash
docker run --rm \
  -v /path/to/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx:alpine nginx -t
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

✅ Config syntax valid.

## HTTP end-to-end test

> Full HTTP test (nginx → FPM → DB) requires all containers up simultaneously and the
> shared `nextcloud-data` volume populated. On real hardware:
> 1. Start the compose stack (`docker compose up -d`)
> 2. Wait ~2 minutes for Nextcloud to install
> 3. Access `https://nextcloud.${DOMAIN}` — should show the Nextcloud login page
> 4. Log in with `NEXTCLOUD_ADMIN_USER` / `NEXTCLOUD_ADMIN_PASSWORD`
> 5. Enable Contacts and Calendar apps in the App menu

## Summary

| Check | Result |
|-------|--------|
| `nextcloud:fpm-alpine` pulled | ✅ 993 MB |
| `nginx:alpine` pulled | ✅ 59 MB |
| ARM64 (both) | ✅ |
| Auto-install via env vars | ✅ config.php created |
| No wizard interaction needed | ✅ |
| DB retry on slow PG start | ✅ (handled gracefully) |
| nginx config syntax | ✅ |
| Full HTTP end-to-end | ⚠️ Deferred to real hardware |
