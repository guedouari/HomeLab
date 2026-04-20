# Sablier — Test Results

## Image pull

```
docker pull acouvreur/sablier:latest
# Digest: sha256:b283e19a5345ac15b8e671ced3e2fe9947ae92919702d96417048aec9a22eab1
# Status: Downloaded newer image for acouvreur/sablier:latest
```

Image size: **47 MB** (ARM64 manifest confirmed ✅).

## Version

```bash
docker run --rm acouvreur/sablier:latest version
# (version=1.8.0, branch=HEAD, revision=2a2079c...)
```

✅ Container starts, version confirmed.

## Caddy plugin

The `http.handlers.sablier` module was confirmed loaded in the custom Caddy build:

```bash
docker run --rm homelab-caddy caddy list-modules | grep sablier
# http.handlers.sablier
```

✅ Caddy plugin present.

## End-to-end on-demand container test

> Requires the full Layer 2 stack running with a configured service. On real hardware:
> 1. Start the compose stack (Caddy + Sablier)
> 2. Set a Layer 3 service to `restart: "no"` and stop it: `docker stop <service>`
> 3. Navigate to `https://<service>.${DOMAIN}`
> 4. Expected: Sablier waiting page appears, then service starts, then redirect to service
> 5. Wait for idle timeout, verify Sablier stops the container again

## Summary

| Check | Result |
|-------|--------|
| Image pulled | ✅ `acouvreur/sablier:latest` (47 MB) |
| ARM64 | ✅ |
| Container starts | ✅ |
| Version confirmed | ✅ v1.8.0 |
| Caddy plugin loaded | ✅ `http.handlers.sablier` |
| On-demand start/stop | ⚠️ Test at Layer 3 with first on-demand service |
