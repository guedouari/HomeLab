# Reverse Proxy — Status

| Check | Result |
|-------|--------|
| Image: custom build | ✅ `homelab-caddy` (109 MB) |
| ARM64 | ✅ (caddy:alpine base is multi-arch; xcaddy cross-compiles) |
| Plugin: cloudflare DNS | ✅ loaded |
| Plugin: sablier | ✅ loaded |
| HTTP serving | ✅ tested |
| TLS DNS-01 (Let's Encrypt) | ⚠️ Requires real domain + Cloudflare token |
| Wildcard cert `*.domain` | ⚠️ Requires real domain |
| Sablier on-demand routing | ⚠️ Test at Layer 3 with first service |

**Overall: ✅ Ready for deployment. TLS and Sablier tests deferred to real hardware with real credentials.**
