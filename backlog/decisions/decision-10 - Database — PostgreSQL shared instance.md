---
id: decision-10
title: Database — PostgreSQL shared instance
date: '2026-04-20 15:27'
status: Accepted
---

## Context

Multiple Layer 3 services need a relational database. Per-service SQLite means scattered backups and different engines. pgvector not needed (Immich removed).

## Decision

Single postgres:17 instance. One database + dedicated user per service. All services that support PostgreSQL use it — no SQLite in production.

## Consequences

One backup target (pg_dumpall). One engine to operate. Nextcloud, Vaultwarden, Gitea all on same instance.
