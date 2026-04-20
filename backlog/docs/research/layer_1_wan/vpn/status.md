# WireGuard — Status

| Check | Result |
|-------|--------|
| Image pulled | ✅ `linuxserver/wireguard:latest` |
| ARM64 confirmed | ✅ manifest present |
| Container starts | ✅ |
| wg0 interface activates | ✅ (WSL2 kernel 6.6 supports WireGuard) |
| Keys auto-generated | ✅ |
| Peer configs generated | ✅ (`peer_phone`, `peer_laptop`) |
| QR codes generated | ✅ PNG files + ASCII in logs |
| Config persists across restarts | ✅ |
| Router port-forward (UDP 51820) | ⚠️ Manual step — cannot automate |
| End-to-end peer connection | ⚠️ Requires real hardware + router access |
| AdGuard Home DNS for VPN peers | ⚠️ Set `PEERDNS` to server LAN IP — verify on real hardware |

**Overall: ✅ Ready for deployment on real hardware.**
