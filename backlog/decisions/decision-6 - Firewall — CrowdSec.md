---
id: decision-6
title: Firewall — CrowdSec
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Layer 1 exposes a UDP port (WireGuard). Layer 2 exposes HTTP/HTTPS. Need lightweight threat detection without managing iptables rules manually.

## Decision

CrowdSec LAPI + iptables bouncer. Scenario-based detection (SSH, HTTP floods). LAPI on port 8090 (8080 conflicts with wslrelay.exe in WSL).

## Consequences

Automated banning of known bad actors. Community threat intelligence feed. No manual firewall rule management.
