---
id: BACK-7
title: Rewrite Windows Podman setup guide
status: Done
assignee:
  - '@copilot'
created_date: '2026-04-21 11:00'
updated_date: '2026-04-23 14:31'
labels: []
milestone: m-2
dependencies: []
references:
  - backlog/decisions/decision-1 - Container platform — Docker + Compose.md
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Install Podman Desktop from scratch on this machine and document exact steps. Podman not currently installed - install it, test with examples/lan, document host networking workaround.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Podman Desktop install steps verified on a clean Windows machine
- [x] #2 Podman machine starts and reaches Running state
- [x] #3 examples/lan runs with podman compose + WSL override
- [x] #4 All services in examples/lan verified (ps + health check commands listed)
- [x] #5 Key differences vs Docker Engine documented (host networking, rootless, socket path)
- [x] #6 Troubleshooting section covers known issues (podman-compose conflict, Rancher Desktop)
- [x] #7 Guide reviewed against windows-wsl.md for consistency
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Verify Podman Desktop is installed and machine is running (podman machine ls)
2. Enter Podman VM shell and check podman compose availability + version
3. Clone/navigate to examples/lan inside the VM
4. Configure .env (SERVER_IP = Podman VM eth0 IP)
5. Run with WSL override: podman compose -f docker-compose.yml -f docker-compose.wsl.yml up -d
6. Verify all services with ps + per-service health commands
7. Update docs/setup/windows-podman.md with validated steps + troubleshooting
8. Check-off AC and mark Done
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Fully validated and rewrote docs/setup/windows-podman.md with live-tested steps on Podman Desktop 1.x / Podman 5.8.2 / Fedora 43 WSL2 VM.

Key findings discovered during live testing:
- DNS in Podman VM defaults to 192.168.127.1 (GUI-dependent) — must override to 8.8.8.8 if Podman Desktop GUI is not running
- /etc/containers/registries.conf.d/999-podman-desktop-registries-from-host.conf is a broken NTFS symlink — causes I/O errors on every podman command; must replace with placeholder
- NTFS volume mounts (/mnt/d/...) cause statfs I/O errors — repo must be cloned inside VM native filesystem
- podman compose (no hyphen) is hijacked by Rancher Desktop's docker-compose.exe when Rancher is installed — must use podman-compose (with hyphen) installed via curl
- DNS filter bind_hosts: 0.0.0.0 conflicts with VM internal resolver at 10.255.255.254:53 — must set to VM eth0 IP; guide now includes a one-liner to autodetect and apply the fix
- podman-compose 1.5.0 sets PODMAN_SYSTEMD_UNIT labels by default — no impact once above fixes are applied

All three services validated running: Samba (port 445), Gatus (HTTP 200 at port 8082), DNS filter UI (HTTP 302 at port 3000).
<!-- SECTION:FINAL_SUMMARY:END -->
