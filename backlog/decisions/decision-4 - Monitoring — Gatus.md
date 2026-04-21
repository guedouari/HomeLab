---
id: decision-4
title: Monitoring — Gatus
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Need lightweight service health monitoring with phone alerts. Uptime Kuma requires a browser wizard and has no PostgreSQL support. Gatus is fully file-configured.

## Decision

Gatus. YAML config file, no wizard, supports ntfy/Telegram/email. Runs in ~20 MB RAM.

## Consequences

Zero-touch deployment via pre-baked config.yaml. Phone alerts at Layer 0 without any WAN setup (outbound ntfy).
