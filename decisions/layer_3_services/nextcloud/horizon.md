# Nextcloud — Horizon

## ONLYOFFICE / Collabora Online (document editing)

Edit Office documents (Word, Excel, PowerPoint) in the browser with full collaborative editing. Requires:
- ONLYOFFICE Document Server (`onlyoffice/documentserver`) — ~2 GB image, x86_64 only
- Collabora Online (`collabora/code`) — ~1 GB image, ARM64 ✅

On ARM64 (Raspberry Pi / NAS): use Collabora Online only — ONLYOFFICE does not support ARM64.

Both require a significant amount of RAM (~1 GB dedicated to the document server). Evaluate carefully on Steam Machine / Pi hardware.

## Nextcloud Talk (video calls)

Nextcloud Talk adds WebRTC video/audio calls. Requires a STUN/TURN server for connections through NAT:
- `coturn` (TURN server) — additional container (~30 MB)
- Talk High Performance Backend — adds signaling server, optional for small groups

For household use (< 5 people), the built-in Talk without HPB is sufficient.

## Nextcloud AIO (All-in-One)

The official `nextcloud/all-in-one` image bundles Nextcloud + PostgreSQL + Redis + Collabora + Talk + Backup in a single orchestrated setup. Trade-offs:
- ✅ Simpler initial setup
- ❌ Bundles its own DB and Redis (duplicates our shared services)
- ❌ Harder to integrate with existing Caddy/Sablier setup
- ❌ ~2 GB+ total image weight

Not recommended in this stack — but a viable alternative for a fresh start.

## Backup

Nextcloud backup requires:
1. Database dump: `docker exec postgres pg_dumpall -U postgres > backup.sql`
2. Data files: `rsync -a data/nextcloud/ backup/nextcloud-data/`
3. Config: `data/nextcloud/config/config.php` (contains secrets — back up securely)

The Nextcloud Backup app can automate this and push to external storage.

## S3-compatible storage backend

Instead of local disk, Nextcloud can store user files in an S3-compatible bucket (Backblaze B2, MinIO, AWS S3). Useful if local storage is limited. Configure via `config.php` `objectstore` key or the Nextcloud External Storage app.
