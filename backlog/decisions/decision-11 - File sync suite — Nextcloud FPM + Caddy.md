---
id: decision-11
title: File sync suite — Nextcloud FPM + Caddy
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Need Google/Apple replacement for files, contacts, calendar, photos. Nextcloud:apache bundles nginx-equivalent but is heavier. FPM + separate HTTP frontend is lighter but adds a container.

## Decision

nextcloud:fpm-alpine + Caddy php_fastcgi (no nginx sidecar). Shared nextcloud-data volume between Nextcloud FPM and Caddy. Nextcloud Memories for photos.

## Consequences

338 MB lighter than nextcloud:apache. One fewer container vs FPM+nginx. Caddy serves static assets and terminates TLS in one hop.
