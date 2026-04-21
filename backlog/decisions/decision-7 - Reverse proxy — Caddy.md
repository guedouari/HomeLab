---
id: decision-7
title: Reverse proxy — Caddy
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Need TLS termination, automatic certificates (DNS-01 ACME via Cloudflare), and a single binary that can also serve as the Nextcloud FPM frontend via php_fastcgi — eliminating a separate nginx container.

## Decision

Caddy with custom build (Cloudflare DNS plugin + Sablier plugin). Caddyfile is the single config file. php_fastcgi replaces nginx for Nextcloud FPM.

## Consequences

Automatic TLS. One fewer container (nginx eliminated). Caddyfile is readable and version-controlled.
