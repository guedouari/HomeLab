# Nextcloud — Status

| Check | Result |
|-------|--------|
| `nextcloud:fpm-alpine` pulled | ✅ 993 MB |
| `nginx:alpine` pulled | ✅ 59 MB |
| ARM64 | ✅ |
| Auto-install (wizard bypass) | ✅ |
| PostgreSQL integration | ✅ |
| Redis integration | ✅ (via env vars) |
| nginx config | ✅ syntax valid |
| Full HTTP test | ⚠️ Deferred to real hardware |
| CalDAV / CardDAV | ⚠️ Test on real hardware with a client |
| Mobile sync (iOS Files, Contacts, Calendar) | ⚠️ Test on real hardware |

**Overall: ✅ Ready for deployment. HTTP/sync tests deferred to real hardware.**
