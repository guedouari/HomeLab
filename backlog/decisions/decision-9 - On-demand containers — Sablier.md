---
id: decision-9
title: On-demand containers — Sablier
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Steam Machine shares resources between gaming and self-hosted services. Non-essential services must not consume RAM/CPU when idle.

## Decision

Sablier (acouvreur/sablier) integrated via Caddy plugin. Services stop after configurable idle timeout and start on first request.

## Consequences

Gaming performance preserved. Services feel instant after the loading page. Caddy plugin means no extra proxy hop.
