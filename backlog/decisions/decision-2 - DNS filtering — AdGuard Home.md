---
id: decision-2
title: DNS filtering — AdGuard Home
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Need network-wide ad blocking + local DNS records. Must be file-configurable (no wizard required after first boot), ARM64, and not bind to port 80.

## Decision

AdGuard Home (official image). Web UI on port 3000. Config pre-baked in AdGuardHome.yaml — skips setup wizard.

## Consequences

Network-wide filtering with per-device stats. HTTPS record support. Pre-baked config means zero-touch deployment.
