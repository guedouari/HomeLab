---
id: decision-8
title: Dynamic DNS — ddns-updater + Cloudflare
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Home IP changes. Need automatic DNS record updates so the public domain always points to the current IP. Cloudflare is the DNS provider.

## Decision

ddns-updater (qmcgaw/ddns-updater) with Cloudflare provider. JSON config file. Runs in ~10 MB RAM.

## Consequences

Domain always resolves to current home IP. Zero-touch after initial config. No dependency on Cloudflare's proprietary DDNS service.
