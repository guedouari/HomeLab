---
id: decision-5
title: VPN — WireGuard
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Need secure remote access to the LAN. Must be fast, modern, and auditable. OpenVPN is slower and more complex to configure.

## Decision

WireGuard (linuxserver/wireguard). Peer configs auto-generated on first start. QR codes for mobile clients.

## Consequences

Fast, low-overhead VPN. Split-horizon DNS means all domain names resolve correctly over VPN. Single exposed port (UDP 51820).
