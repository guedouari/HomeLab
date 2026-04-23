---
id: BACK-13
title: Story — capture hardware profile once
status: To Do
assignee: []
created_date: '2026-04-23 22:20'
updated_date: '2026-04-23 22:21'
labels:
  - epic-wizard
  - sprint-1
dependencies: []
references:
  - src/schema.ts
documentation:
  - backlog/docs/doc-4 - Architecture-—-HomeLab-Generator.md
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
As a user I want to specify OS and hardware target once so all layers use it without re-asking
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Hardware profile captured in single wizard step
- [ ] #2 All downstream layers reference same hardware object
- [ ] #3 wslOverride auto-derived when os === windows
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Read GeneratorInput.hardware from schema.ts. Single prompt captures os + target. Derive wslOverride from os===windows. Pass hardware object to all layer generators.
<!-- SECTION:PLAN:END -->
