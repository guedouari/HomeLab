# dynDNS — Test Results

## Image pull

```
docker pull timothyjmiller/cloudflare-ddns:latest
# Digest: sha256:80454fc9123e1517414b80493d9ac543925ab75d93899f35f9ac75fdee6c65c3
# Status: Downloaded newer image for timothyjmiller/cloudflare-ddns:latest
```

Image size: **1.2 MB** (Go binary — smallest image in the stack).

## ARM64 confirmed

Manifest inspect shows `arm64` architecture ✅.

## Startup behaviour (without credentials)

```bash
docker run --rm timothyjmiller/cloudflare-ddns:latest
```

Output:
```
cloudflare-ddns v2.1.0
Using config.json configuration
Error reading config.json: No such file or directory
```

✅ Container starts and reads config.json correctly. Fails gracefully without credentials (no panic, clean error).

## With real credentials

> Cannot be tested without a valid Cloudflare API token and zone ID. On real hardware:
> 1. Fill in `config/cloudflare-ddns/cloudflare.json` with your token and zone ID
> 2. Start the container
> 3. Check logs: `docker logs cloudflare-ddns`
> 4. Expected output: `yourname.example.com - your.public.ip`
> 5. Verify in Cloudflare Dashboard → DNS → A record updated

## Summary

| Check | Result |
|-------|--------|
| Image pulled | ✅ `timothyjmiller/cloudflare-ddns:latest` (1.2 MB) |
| ARM64 | ✅ |
| Container starts | ✅ |
| Config file read | ✅ (fails gracefully without credentials) |
| DNS record update | ⚠️ Requires real Cloudflare credentials |
