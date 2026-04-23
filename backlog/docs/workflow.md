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

Every BMAD concept maps to a native Backlog.md primitive — no translation layer,
no separate tracking files, no drift between what agents produced and what the
board shows.

---

## Concept Mapping

| BMAD concept | Backlog.md primitive | Command |
|---|---|---|
| PRD | Doc (`type: prd`) | `backlog doc create --type prd "Title"` |
| Architecture doc | Doc (`type: architecture`) | `backlog doc create --type architecture "Title"` |
| Sprint goal | Doc (`type: sprint-goal`) | `backlog doc create --type sprint-goal "Sprint N"` |
| Retrospective | Doc (`type: retrospective`) | `backlog doc create --type retrospective "Sprint N Retro"` |
| Proposed ADR | Decision (`status: Proposed`) | `backlog decision create -s Proposed "Title"` |
| Accepted ADR | Decision (`status: Accepted`) | `backlog decision create -s Accepted "Title"` |
| Epic | Parent task (`--no-dod-defaults`) | `backlog task create "Epic — X" --no-dod-defaults` |
| Story candidate | Draft | `backlog draft create "Story — Y" -l "epic-X"` |
| Story (committed to sprint) | Task (promoted from draft) | `backlog draft promote DRAFT-N` |
| **Sprint** | **Milestone** (`m-sprint-N`) | `backlog task edit N -m m-sprint-N` |
| Release | Epic done % | All epic subtasks Done → feature shipped |
| Project context | `_bmad-output/project-context.md` | BMAD-internal only |

---

## Milestone Strategy — Sprint as Milestone (Direction A)

**Milestones are sprint containers, not release gates.**

`backlog task list -m m-sprint-1 --plain` is the only label-style filter that
works on `task list` from the CLI — so milestones do the job sprints need.
Release tracking falls to epic parent task completion (all subtasks Done).

```
Sprint milestone    m-sprint-N     rotating, archived on sprint close
Epic parent task    BACK-N         permanent, closes when all stories Done
Release             (no primitive) emerges when all epics for a phase close
```

### Sprint lifecycle

```
1. Planning
   backlog milestone create m-sprint-1 "Sprint 1 — <goal>"
   backlog draft list --plain                 review candidates
   backlog draft promote DRAFT-N              commit story to sprint
   backlog task edit BACK-N -m m-sprint-1    assign to sprint milestone
   backlog doc create --type sprint-goal "Sprint 1 — <goal>"

2. Execution
   backlog task list -m m-sprint-1 --plain   sprint board
   backlog sequence list --plain              what's unblocked
   backlog task list -m m-sprint-1 -s "In Progress" --plain

3. Close
   backlog task list -m m-sprint-1 --plain   verify all Done
   backlog milestone archive m-sprint-1
   backlog doc create --type retrospective "Sprint 1 Retro"
   # incomplete tasks: reassign to m-sprint-2 or demote back to draft
```

### Release tracking (replaces milestone %)

```
backlog task list -p BACK-12 --plain   all stories in epic, with status
backlog overview                       aggregate: completion %, blocked, stale
```

When all stories under an epic parent are Done → that feature is shipped.
No formal release milestone needed unless you need audit trail (see Direction C).

### Alternative: Direction C (more control)

Keep both release milestones AND sprint milestones if you need formal release
tracking from CLI:

```
m-layer-0, m-generator  →  permanent release gates (never archive)
m-sprint-N              →  rotating sprint containers (archive on close)

Sprint planning: assign to m-sprint-N
Sprint close:   reassign incomplete tasks to m-sprint-N+1 or release milestone
Release view:   backlog task list -m m-layer-0 --plain
```

More ceremony (two milestone assignments per task) — use when release reporting
matters more than simplicity.

### Legacy milestones (m-1 through m-14)

The existing 14 milestones are **phasing out** — they represent an earlier
release-gate model. Do not assign new tasks to them. Archive each one as its
tasks naturally migrate to sprint milestones during normal sprint planning.

---

## Two Axes on Every Task

```
Parent task  →  epic     (what group: BACK-N as --parent)
Milestone    →  sprint   (when: m-sprint-N, the CLI-filterable execution window)
```

Label `l:sprint-N` is kept on tasks as metadata for the browser UI but is not
the primary sprint filter — milestone is.

A story belongs to epic "Generator Wizard" AND sprint-1 AND milestone m-6
simultaneously. Each axis answers a different question.

---

## Decision Lifecycle

Decisions live in `backlog/decisions/` from the moment they are raised.
Status tracks their lifecycle — no file moves needed:

```
Proposed   →  Winston raises it; under discussion
Accepted   →  Locked in; all stories must conform
Deprecated →  Superseded by a newer decision
```

---

## BMAD Config Paths (`_bmad/bmm/config.yaml`)

```yaml
planning_artifacts:       "{project-root}/backlog/docs"
implementation_artifacts: "{project-root}/backlog/docs"
decisions:                "{project-root}/backlog/decisions"
project_knowledge:        "{project-root}/docs"
```

All BMAD artifact docs land in `backlog/docs/` with typed frontmatter.
`backlog/drafts/` is reserved exclusively for story candidates (draft tasks).

---

## Phase Flow

### Phase 1 — Discovery (Mary / John)

```bash
backlog doc create --type prd "PRD — <project name>"
# fill in content: problem, goals, user stories, open questions
```

### Phase 2 — Architecture (Winston)

```bash
# Architecture document
backlog doc create --type architecture "Architecture — <project name>"

# One decision per significant choice
backlog decision create -s Proposed "Use X for Y"
# ... after discussion, update status to Accepted in the file frontmatter
```

### Phase 3 — Epic & Story Breakdown (John / Winston)

```bash
# Create epic as parent task — no DoD, no implementation
backlog task create "Epic — <name>" --no-dod-defaults \
  -d "<epic goal>" -l "epic-<slug>"

# Create story candidates as drafts under the epic
backlog draft create "Story — <name>" \
  -d "As a <user> I want <goal> so that <value>" \
  -l "epic-<slug>"
# repeat for all stories in this epic
```

Stories stay as drafts — visible on the board, not yet committed to a sprint.

### Phase 4 — Sprint Planning (John)

```bash
# Review story candidates
backlog draft list --plain

# Check execution order constraints
backlog sequence list --plain

# Promote selected stories to tasks + assign to sprint milestone
backlog draft promote DRAFT-N
backlog task edit BACK-N -m m-sprint-1 \
  --plan "<technical approach from Winston>" \
  --doc backlog/docs/<arch-doc>.md \
  --ref src/<relevant-file>.ts \
  --dep BACK-M   # if this story depends on another

# Capture sprint goal
backlog doc create --type sprint-goal "Sprint 1 — <goal statement>"
```

Unpromoted drafts stay in the backlog for future sprints.

### Phase 5 — Execution (Amelia, per story)

```bash
# Pick up next unblocked story
backlog sequence list --plain

# Assign and start
backlog task edit BACK-N -s "In Progress" -a @amelia

# Implement → mark AC done as each is completed
backlog task edit BACK-N --check-ac 1 --check-ac 2

# Append notes during work
backlog task edit BACK-N --append-notes $'- Implemented X\n- Added tests for Y'

# Wrap up
backlog task edit BACK-N --final-summary "<PR-style summary>" -s Done
```

### Phase 6 — Sprint Review & Retro (all)

```bash
# Check sprint completion
backlog task list -l sprint-1 --plain
backlog overview

# Write retro
backlog doc create --type retrospective "Sprint 1 Retro"
# fill in: what shipped, what didn't, why, next sprint adjustments
```

---

## Execution Order with Dependencies

Winston creates stories with `--dep` chains during breakdown.
All referenced tasks must exist before adding the dependency.

```bash
# Create all stories first (no deps yet)
backlog draft create "Story — schema validation" -l "epic-generator-core"
backlog draft create "Story — Layer 0 generator" -l "epic-generator-core"

# Then add dependency after promotion
backlog task edit BACK-N --dep BACK-M
```

Query the critical path at any time:

```bash
backlog sequence list --plain   # shows sequenced chains + unsequenced tasks
backlog overview                 # shows blocked tasks, stale tasks, completion %
```

---

## Phase-Close Rule

**No BMAD phase closes without a Backlog.md action.**

| Phase closes | Required Backlog.md action |
|---|---|
| Discovery | `backlog doc create --type prd` |
| Architecture | `backlog doc create --type architecture` + `backlog decision create` |
| Epic breakdown | `backlog task create "Epic —"` + `backlog draft create` (stories) |
| Sprint planning | `backlog draft promote` + sprint label + `backlog doc create --type sprint-goal` |
| Story done | `--check-ac` all ACs + `--final-summary` + `-s Done` |
| Sprint retro | `backlog doc create --type retrospective` |

---

## CLI Filtering Reference

`backlog task list` supports: `--status`, `--assignee`, `--milestone`, `--parent`, `--priority`.
It does **not** support label filtering — use the browser UI for sprint-label views.

```bash
# Board
backlog board        # full kanban
backlog overview     # health: blocked, stale, completion %

# Filter by epic (all stories under a parent task)
backlog task list -p BACK-N --plain

# Filter by milestone (release scope)
backlog task list -m m-6 --plain

# Filter by status (execution view)
backlog task list -s "In Progress" --plain

# Execution order
backlog sequence list --plain

# Find an artifact doc by keyword
backlog search "prd" --type document --plain
backlog search "architecture" --type document --plain

# All decisions
backlog search "." --type decision --plain

# Draft backlog (story candidates)
backlog draft list --plain
```
