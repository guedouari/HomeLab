---
id: BACK-14
title: Story — select services per layer
status: To Do
assignee: []
created_date: '2026-04-23 22:20'
updated_date: '2026-04-23 22:21'
labels:
  - epic-wizard
  - sprint-1
dependencies:
  - BACK-13
references:
  - src/schema.ts
documentation:
  - backlog/docs/doc-4 - Architecture-—-HomeLab-Generator.md
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
As a user I want to choose which services to include per layer from a curated list
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Curated service list shown per layer
- [ ] #2 User can toggle services on/off
- [ ] #3 Selection stored in GeneratorInput.services[]
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Present curated service list per layer from config/services.ts. User toggles inclusion. Output services[] on GeneratorInput. Requires BACK-13 hardware profile.
<!-- SECTION:PLAN:END -->
