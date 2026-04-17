# File Sharing — Configuration

> This file captures configuration design. Nothing here is finalised until `testing.md` confirms it works.

## Authentication Model

### Options

| Model | Description | Use case |
|-------|-------------|---------|
| **Guest / anonymous** | No credentials — anyone on LAN can read/write | Public shares (media, downloads) |
| **Named user accounts** | Username + password required | Private shares (personal files, backup) |
| **Mixed** | Some shares guest, some authenticated | Recommended: public media + private files |

### Proposed model

Mixed access:
- Public shares (e.g. `media`) — guest readable and writable; no login prompt on any device
- Private shares (e.g. `files`, `backup`) — require credentials

User accounts added via `ACCOUNT_<username>=<password>` environment variables. No LDAP or external auth — keep it simple for Layer 0.

---

## Share Layout (proposed)

| Share | Container path | Host path | Guest access | Notes |
|-------|---------------|-----------|:------------:|-------|
| `media` | `/shares/media` | `./data/media` | ✅ read-write | Smart TV, Steam Deck, all devices |
| `files` | `/shares/files` | `./data/files` | ❌ | Authenticated users only |
| `backup` | `/shares/backup` | `./data/backup` | ❌ | Authenticated users only |

Volumes mounted under `/shares/` inside the container (convention for `servercontainers/samba`).

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
