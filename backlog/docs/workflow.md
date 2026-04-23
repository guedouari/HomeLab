---
id: doc-2
title: BMAD ↔ Backlog.md Workflow
---

# BMAD ↔ Backlog.md Workflow

This document defines how BMAD agent work flows into Backlog.md so everything
stays visible on the board and traceable to its origin.

---

## Core Principle

**BMAD owns thinking. Backlog.md owns execution.**

BMAD agents produce artifacts (PRDs, architecture docs, sprint plans, ADRs).
Backlog.md tracks the work those artifacts spawn (tasks, milestones, sprints).
The bridge between them is the `--doc` and `--ref` flags on tasks, and the
graduation protocol below.

---

## Folder Mapping

| BMAD concept | Backlog.md home | Notes |
|---|---|---|
| Planning artifact (WIP) | `backlog/drafts/` | Board-visible as drafts |
| Finalized doc (sprint plan, retro, architecture) | `backlog/docs/` | Board-visible as docs (add `id: doc-N` frontmatter) |
| Accepted decision (ADR) | `backlog/decisions/` | `decision-N - title.md` format |
| Proposed decision (draft ADR) | `backlog/drafts/` | Graduate to `decisions/` on acceptance |
| Project knowledge / guides | `docs/` | Developer reference, not board-surfaced |
| Agent scaffolding / session logs | `_bmad-output/` | BMAD-internal, not board-surfaced |

### BMAD config paths (`_bmad/bmm/config.yaml`)

```yaml
planning_artifacts:       "{project-root}/backlog/drafts"
implementation_artifacts: "{project-root}/backlog/docs"
decisions:                "{project-root}/backlog/decisions"
project_knowledge:        "{project-root}/docs"
```

---

## Milestone vs Sprint

These are **orthogonal** — do not conflate them.

| Concept | Answers | Backlog.md home |
|---|---|---|
| **Milestone** | What do we ship together? | `backlog milestone` — permanent scope boundary |
| **Sprint** | What do we work on this week? | `backlog/docs/sprint-N.md` — execution window doc |

Tasks belong to **one milestone** (scope anchor). A sprint doc **selects** tasks
from any milestone for the current execution window. Tasks never change their
milestone during a sprint.

BMAD epics map 1:1 to Backlog.md milestones. When BMAD generates epics from a
PRD, each epic must reference an existing milestone by ID.

---

## Artifact Graduation Protocol

Artifacts move through three states. The **promotion trigger** is a workflow
event, not a judgment call.

```
BMAD agent produces artifact
         │
         ▼
  backlog/drafts/          ← WIP; board-visible as draft
  (planning phase)
         │
         │  Promotion trigger fires (see table below)
         ▼
  backlog/docs/            ← Finalized; board-visible as doc
  backlog/decisions/       ← Accepted ADR
  (execution / permanent)
```

| Artifact | Promotion trigger |
|---|---|
| PRD | Architect sign-off (Winston review complete) |
| Architecture doc | SM accepts into sprint |
| Sprint plan | Sprint kicks off |
| Draft ADR | Decision formally accepted |

To promote a doc: move the file + add `id: doc-N` frontmatter (for `docs/`) or
`id`, `title`, `date`, `status: Accepted` frontmatter (for `decisions/`).

---

## Phase-Close Protocol

Every BMAD phase ends with tasks being created. **No phase closes without a
`backlog task create`.**

At minimum, create:

```bash
# Example — close of architecture phase
backlog task create "Implement <component>" \
  -d "<one-line why>" \
  -l <layer-label> \
  --doc backlog/docs/<arch-doc>.md   # traceability to the artifact
```

Use `--doc` for documents produced in this session.
Use `--ref` for source files or external URLs relevant to implementation.

---

## Sprint Lifecycle

```
1. Sprint planning  →  BMAD (Winston/Amelia) produces sprint plan
                       saved to backlog/drafts/sprint-N-plan.md

2. Sprint kickoff   →  Move file to backlog/docs/sprint-N.md
                       Add id: doc-N frontmatter
                       Create/assign tasks via backlog task create / edit

3. Execution        →  Work tasks; mark ACs done via backlog task edit --check-ac

4. Sprint review    →  Update task statuses to Done
                       Verify milestone completion: backlog milestone list --plain

5. Retrospective    →  BMAD produces retro doc
                       Saved directly to backlog/docs/sprint-N-retro.md
                       (no draft stage — retros are written post-sprint)
```

---

## Quick Reference

```bash
# View board
backlog board

# View all milestones
backlog milestone list --plain

# Create a task linked to a BMAD artifact
backlog task create "Title" -d "why" --doc backlog/docs/arch.md --ref src/generate.ts

# Graduate a planning artifact to docs
# 1. Move file: mv backlog/drafts/prd.md backlog/docs/prd.md
# 2. Add frontmatter: id: doc-N, title: ...
# 3. Update any tasks referencing it: backlog task edit N --doc backlog/docs/prd.md
```
