---
id: decision-3
title: File sharing — Samba
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Need LAN file shares accessible from Windows, macOS, and Linux without installing client software. Avahi (mDNS) and wsdd2 (WS-Discovery) enable zero-config discovery.

## Decision

Samba (dperson/samba or servercontainers/samba) with Avahi + wsdd2 bundled. Guest-only shares — no account management needed on a trusted LAN.

## Consequences

Works out of the box on all OS. Windows Network shows the server automatically via WS-Discovery. macOS Finder via mDNS.
