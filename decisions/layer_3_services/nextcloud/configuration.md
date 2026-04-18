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
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_HOST_PASSWORD` | `...` | Redis password |
| `PHP_UPLOAD_LIMIT` | `512M` | Max upload size |
| `PHP_MEMORY_LIMIT` | `512M` | PHP memory limit |
| `OVERWRITEPROTOCOL` | `https` | Force HTTPS in generated URLs (behind reverse proxy) |
| `OVERWRITECLIURL` | `https://nextcloud.homelab.example.com` | CLI URL for cron jobs |

## nginx config (`config/nextcloud-nginx/nginx.conf`)

```nginx
upstream php-handler {
    server 127.0.0.1:9000;
}

server {
    listen 8081;
    server_name _;

    root /var/www/html;
    index index.php index.html;

    client_max_body_size 512M;
    client_body_timeout 300s;

    gzip on;
    gzip_vary on;
    gzip_comp_level 4;
    gzip_types text/plain text/css text/javascript application/javascript
               text/xml application/xml application/json;

    location = /robots.txt { allow all; log_not_found off; access_log off; }

    location ^~ /.well-known {
        location = /.well-known/carddav { return 301 /remote.php/dav/; }
        location = /.well-known/caldav  { return 301 /remote.php/dav/; }
        return 301 /index.php$request_uri;
    }

    location ~ ^/(?:build|tests|config|lib|3rdparty|templates|data)(?:$|/) {
        return 404;
    }

    location ~ \.php(?:$|/) {
        rewrite ^/(?!index|remote|public|cron)(\/\S+)?$ /index.php$uri last;
        fastcgi_split_path_info ^(.+?\.php)(/.*)$;
        set $path_info $fastcgi_path_info;
        if (!-f $document_root$fastcgi_script_name) { return 404; }
        fastcgi_param HTTPS on;
        fastcgi_param modHeadersAvailable true;
        fastcgi_param front_controller_active true;
        fastcgi_pass php-handler;
        fastcgi_intercept_errors on;
        fastcgi_request_buffering off;
        fastcgi_max_temp_file_size 0;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $path_info;
    }

    location ~ \.(?:css|js|svg|gif|png|jpg|ico|wasm|tflite|map|ogg|flac)$ {
        try_files $uri /index.php$request_uri;
        expires 6M;
        access_log off;
    }

    location ~ \.woff2?$ {
        try_files $uri /index.php$request_uri;
        expires 7d;
        access_log off;
    }

    location /remote { return 301 /remote.php$request_uri; }

    location / { try_files $uri $uri/ /index.php$request_uri; }
}
```

## Shared volume

`nextcloud:fpm-alpine` writes app files to `/var/www/html`. `nginx:alpine` reads from the same path (mounted read-only) to serve static assets directly. Both containers share a named Docker volume `nextcloud-data`.

## Cron (background jobs)

Nextcloud requires periodic background jobs (file indexing, notifications, etc.). The recommended method is a system cron job on the host:

```bash
# Add to /etc/cron.d/nextcloud (run every 5 minutes):
*/5 * * * * root docker exec --user www-data nextcloud php -f /var/www/html/cron.php
```

Or use Nextcloud's built-in `webcron` feature (less reliable) — configure in Admin → Basic settings → Background jobs.

## Caddy route (add to Caddyfile)

```caddy
@nextcloud host nextcloud.{$DOMAIN}
handle @nextcloud {
  reverse_proxy localhost:8081
}
```

No Sablier — Nextcloud must always be running for CalDAV/CardDAV sync to work reliably.
