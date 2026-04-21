---
id: decision-1
title: Container platform — Docker + Compose
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Need a portable, broadly-supported container runtime that works on x86_64, ARM64, and NAS hardware without vendor lock-in.

## Decision

Docker Engine + Docker Compose. Single-node, no orchestrator. Compose files are the deployment unit.

## Consequences

Portable across all target hardware. No Kubernetes complexity. Compose files serve as both the reference implementation and the generator output template.
