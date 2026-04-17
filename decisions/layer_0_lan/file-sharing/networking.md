# File Sharing — Docker Networking

## The Problem

SMB requires several ports. How those are exposed determines whether network discovery (browsing `\\server` in Windows Explorer) works, or whether users must access shares directly by IP.

## Port Requirements

| Port | Protocol | Purpose |
|------|----------|---------|
| 445 | TCP | SMB (primary, modern) |
| 139 | TCP | SMB over NetBIOS (legacy compatibility) |
| 137–138 | UDP | NetBIOS Name Service (discovery only) |

## Networking Mode Comparison

| Mode | Share access | Network discovery | Complexity |
|------|:------------:|:-----------------:|:----------:|
| **Bridge + port mapping** | ✅ | ❌ NetBIOS/mDNS broken through NAT | Low |
| **Host networking** | ✅ | ✅ | Low — but reduces container isolation |
| **macvlan** | ✅ | ✅ | High — needs router/switch support |

## Analysis

Discovery (browsing `\\server` in Windows Explorer or Finder) requires NetBIOS or mDNS/WSD traffic that does not traverse Docker NAT cleanly. It is a **convenience feature only** — shares accessed directly by IP (`\\192.168.1.10\media`) always work regardless of networking mode.

Bridge networking is the simplest and most consistent choice across all three hardware targets. Host networking works but reduces isolation. macvlan adds operational complexity that is not justified for home use.

## Open Questions

1. **WSL-specific**: Windows owns port 445 on the host. Does this prevent the container from binding it even through bridge networking in WSL? → To be answered in `testing.md`.
2. **Discovery trade-off**: Is direct-IP access acceptable, or do we need discovery for the Smart TV / Android targets?
3. **Host networking**: worth evaluating if bridge causes unexpected issues during testing.

## Recommendation (not yet validated)

Start with bridge + port mapping. Document the direct-IP access approach. Revisit if testing reveals issues.
