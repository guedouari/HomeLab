---
id: BACK-10
title: Test all example layers with Podman Compose — full compatibility report
status: In Progress
assignee:
  - '@copilot'
created_date: '2026-04-21 16:32'
updated_date: '2026-04-23 10:28'
labels:
  - podman
  - testing
  - compatibility
milestone: m-sprint-0
dependencies: []
references:
  - backlog/decisions/decision-1 - Container platform — Docker + Compose.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Run all four example layers (lan, wan, domain, services) using Podman Compose in WSL2. Document what works, what fails, and why. Cover Podman-specific issues: rootless caps, host networking, Docker socket → Podman socket migration (Sablier), restart policies, WireGuard SYS_MODULE, and the Caddy custom build.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All four layers attempted with podman compose up
- [ ] #2 Each service status (running / failed / degraded) recorded
- [ ] #3 Root cause documented for every failure
- [ ] #4 Manual verification command listed for every service
- [ ] #5 Report written to backlog/docs/ as podman-compatibility.md
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Access Podman machine via wsl -d podman-machine-default (IP: 192.168.143.14)
2. Copy repo examples into the Podman VM
3. Test Layer 0 (lan) with wsl overlay — podman compose up
4. Test Layer 1 (wan) — note WireGuard SYS_MODULE + caps
5. Test Layer 2 (domain) — note Caddy custom build
6. Test Layer 3 (services) — note Sablier Docker socket
7. Collect per-service status/logs
8. Write report to backlog/docs/podman-compatibility.md
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Session paused. Progress so far:
- Task created and set In Progress
- Podman machine confirmed: wsl -d podman-machine-default (Fedora 43, Podman 5.8.2, IP 192.168.143.14)
- podman compose currently hijacked by Rancher Desktop's docker-compose provider — need to install podman-compose via dnf as root (slow dnf download interrupted)
- Next: install podman-compose, then run each layer and collect results
<!-- SECTION:NOTES:END -->
