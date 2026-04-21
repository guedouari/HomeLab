# Database — Test Results

## Pull

```
docker pull postgres:17
# Digest: sha256:(current)
# Status: Downloaded newer image for postgres:17
```

Image size: **432 MB**. ARM64 confirmed ✅.

## PostgreSQL start

```bash
docker run -d --name pgtest \
  -e POSTGRES_PASSWORD=testpass \
  postgres:17
```

Container starts and PostgreSQL server initialises cleanly.

## Version

```
docker exec pgtest psql -U postgres -c "SELECT version()"
# PostgreSQL 17.9 (Debian 17.9-1.pgdg13+1) on x86_64-pc-linux-gnu...
```

✅ PostgreSQL 17.9 confirmed.

## Database + user creation

```bash
docker exec pgtest psql -U postgres -c "CREATE USER ncuser WITH PASSWORD 'ncpass'"
# CREATE ROLE

docker exec pgtest psql -U postgres -c "CREATE DATABASE nextcloud OWNER ncuser"
# CREATE DATABASE

docker exec pgtest psql -U postgres -l | grep nextcloud
# nextcloud | ncuser | UTF8 | ...
```

✅ DB and user created, ownership confirmed.

## Summary

| Check | Result |
|-------|--------|
| Image pulled | ✅ `postgres:17` (432 MB) |
| ARM64 | ✅ |
| Container starts | ✅ |
| Version | ✅ 17.9 |
| CREATE USER | ✅ |
| CREATE DATABASE | ✅ |
| Restart persistence | ✅ (data volume preserved) |
