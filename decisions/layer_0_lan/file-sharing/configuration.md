# File Sharing — Configuration

> This file captures configuration design. Nothing here is finalised until `testing.md` confirms it works.

## Authentication Model

**Goal: works out of the box on all clients, no client configuration.**

| Client | Behaviour |
|--------|-----------|
| Windows 10+ | Prompted once for `homelab` / `homelab`, saved to Credential Manager — never asked again |
| macOS / iOS | Connects as guest automatically via Avahi (`HomeLab.local`) |
| Linux | Connects as guest anonymously |
| Android | Connects as guest (any SMB client) |

**Why not pure guest?** Windows 10+ enforces `EnableInsecureGuestLogons=False` in the SMB client driver (`mrxsmb.sys`). This is a client-side policy — there is no server-side workaround. The only path to zero-client-config on Windows is a real account Windows can authenticate against.

**Why not more accounts?** One shared LAN credential is all that's needed. LAN is trusted — this is convenience, not security.

**How `MAP_TO_GUEST=Bad User` works:**
- Unknown username → mapped to guest → gets in ✅ (macOS, Android, Linux)
- Known user (`homelab`) + wrong password → `NT_STATUS_LOGON_FAILURE` (expected — prevents guessing)
- No credentials at all → guest ✅

---

## Networking Mode

**`network_mode: host`** — required for Avahi mDNS multicast. No port mappings needed.

`CAP_NET_ADMIN` capability required by wsdd2.

---

## Discovery

All three discovery daemons enabled:

| Daemon | Protocol | Clients | Notes |
|--------|----------|---------|-------|
| **avahi** | mDNS/Bonjour | macOS Finder, iOS Files | Advertises as `HomeLab.local` |
| **wsdd2** | WS-Discovery | Windows Network sidebar | Needs `CAP_NET_ADMIN` |
| **nmbd** | NetBIOS | Legacy — older TVs, Android apps | Superseded by wsdd2 but harmless |

Optional Avahi tuning:

| Variable | Purpose | Default |
|----------|---------|---------|
| `AVAHI_NAME` | Name shown in Finder / Windows | `HomeLab` |
| `AVAHI_INTERFACES` | Restrict to one interface | all |
| `MODEL` | macOS device icon | `TimeCapsule` |

---

## Share Layout

All shares accessible to all LAN users — guest or authenticated.

| Share | Container path | Host path | Purpose |
|-------|---------------|-----------|---------|
| `media` | `/shares/media` | `./data/media` | Media files — Smart TV, Steam Deck, etc. |
| `files` | `/shares/files` | `./data/files` | General file exchange |
| `backup` | `/shares/backup` | `./data/backup` | Backups |

---

## macOS / iOS extras (built-in)

The image enables `vfs_fruit` and `streams_xattr` globally by default:
- macOS Finder metadata, tags, and resource forks handled correctly
- iOS Files app connects cleanly
- `fruit:model = TimeCapsule` — shows TimeCapsule icon in macOS Finder

For Time Machine on a share, add `fruit:time machine = yes` to that share's config (see `horizon.md`).

---

---

## Environment Variables (servercontainers/samba)

Key variables — to be validated during testing:

| Variable | Purpose | Proposed value |
|----------|---------|----------------|
| `ACCOUNT_<username>` | Create a user with password | `ACCOUNT_alice=${SAMBA_PASSWORD}` |
| `SAMBA_VOLUME_CONFIG_<name>` | Define a share (`;` = newline) | See below |
| `AVAHI_DISABLE` | Disable mDNS/Bonjour discovery | `1` — needs host mode, deferred |
| `WSDD2_DISABLE` | Disable WSD discovery | _(unset)_ — enabled for Windows Network Browser |
| `NETBIOS_DISABLE` | Disable NetBIOS | `1` — superseded by wsdd2 |
| `SAMBA_CONF_WORKGROUP` | Windows workgroup name | `WORKGROUP` |
| `SAMBA_CONF_SERVER_STRING` | Server description | `HomeLab` |
| `TZ` | Timezone | from `.env` |

### Share variable format

```
SAMBA_VOLUME_CONFIG_media=[media]; path = /shares/media; guest ok = yes; read only = no
SAMBA_VOLUME_CONFIG_files=[files]; path = /shares/files; valid users = alice; guest ok = no; read only = no
```

## Discovery

The image bundles three discovery daemons. Each can be independently enabled/disabled.

| Daemon | Protocol | Works in bridge? | Env to disable |
|--------|----------|:----------------:|----------------|
| wsdd2 | WS-Discovery (WSD) | ✅ | `WSDD2_DISABLE=1` |
| avahi | mDNS/Bonjour | ❌ needs host mode | `AVAHI_DISABLE=1` |
| nmbd | NetBIOS | ⚠️ limited | `NETBIOS_DISABLE=1` |

**Current choice:** WSDD2 enabled (bridge-compatible), Avahi and NetBIOS disabled.

Optional Avahi tuning (when/if host mode is adopted):

| Variable | Purpose | Example |
|----------|---------|---------|
| `AVAHI_NAME` | Name shown in Finder | `HomeLab` |
| `AVAHI_INTERFACES` | Restrict to one interface | `eth0` |
| `MODEL` | macOS device icon | `TimeCapsule` |

---
