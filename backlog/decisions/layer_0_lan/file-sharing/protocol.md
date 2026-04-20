# File Sharing — Protocol

## Candidates

| Protocol | Full name | Windows | macOS | Linux | Android | iOS |
|----------|-----------|:-------:|:-----:|:-----:|:-------:|:---:|
| **SMB/CIFS** | Server Message Block | ✅ native | ✅ native | ✅ native | ✅ native | ✅ native |
| **NFS** | Network File System | ⚠️ extra install | ✅ native | ✅ native | ❌ | ❌ |

## Elimination

**NFS is eliminated.**

The [device support matrix](../../device-support-matrix.md) includes Windows, Android, and iOS. None of these support NFS natively. NFS would require per-device configuration on Windows and is entirely unavailable on Android and iOS — unacceptable for a stack that must work out of the box across all targets.

**SMB/CIFS (Samba) is the only protocol that covers all targets without per-device setup.**

## Open Questions

- None. Protocol choice is settled by the device matrix.
