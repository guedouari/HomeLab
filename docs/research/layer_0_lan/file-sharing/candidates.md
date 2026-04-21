# File Sharing — Image Candidates

## Linuxserver

No linuxserver image exists for Samba. Confirmed by checking `lscr.io/linuxserver/` — no samba image is published. The linuxserver constraint does not apply here.

## Evaluated Images

| Image | Registry | Pulled & verified | Maintained | Config style | Notes |
|-------|----------|:-----------------:|:----------:|--------------|-------|
| `ghcr.io/servercontainers/samba` | GitHub Container Registry | ✅ verified | ✅ active | Env vars | smbd 4.22.8, all 3 shares tested, selected |
| `crazymax/samba` | Docker Hub | — | ✅ active | YAML file | Not evaluated — leading candidate sufficient |
| `dperson/samba` | Docker Hub | — | ❌ dead (4+ years) | — | Excluded immediately |

> **Rule:** The "Pulled & verified" column must be ✅ before an image can be selected. Do not change status here without actually pulling the image and confirming it runs.

## Leading Candidate

`ghcr.io/servercontainers/samba` — env-var driven configuration fits Docker Compose well; no config file to manage. Active development, multi-arch.

This remains a **candidate**, not a decision, until `testing.md` has passing results.

## Open Questions

1. Does `ghcr.io/servercontainers/samba` pull successfully in the current environment (WSL + Docker)?
2. Does `crazymax/samba` need to be evaluated further, or is the leading candidate sufficient once verified?
3. Are there other images worth evaluating before locking in?
