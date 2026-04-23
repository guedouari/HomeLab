---
id: DRAFT-1
title: Implement Layers 1-3 compose generation
status: To Do
assignee: []
created_date: '2026-04-20 13:52'
updated_date: '2026-04-23 10:28'
labels:
  - generator
milestone: m-8
dependencies: []
references:
  - backlog/decisions/decision-1 - Container platform — Docker + Compose.md
  - backlog/decisions/decision-2 - Generator Architecture — code-first TypeScript, isomorphic core.mdpriority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extend generator to produce wan/, domain/, services/ compose files and .env. Each layer is a superset of the previous. Reuse Layer 0 service definitions.
<!-- SECTION:DESCRIPTION:END -->
