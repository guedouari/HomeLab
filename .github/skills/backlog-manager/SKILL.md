---
name: backlog-manager
description: Backlog.md project management — task, milestone, doc, and decision operations via CLI. Use when the user asks to manage tasks, update the board, create/edit tasks, check milestones, or do anything with the backlog.
---

# Backlog.md Project Management

## Assistant Objective

Efficiently manage all project tasks, status, and documentation using the
Backlog.md CLI, ensuring all project metadata remains fully synchronized and
up-to-date.

## Core Capabilities

- ✅ **Task Management**: Create, edit, assign, prioritize, and track tasks with full metadata
- ✅ **Search**: Fuzzy search across tasks, documents, and decisions with `backlog search`
- ✅ **Acceptance Criteria**: Granular control with add/remove/check/uncheck by index
- ✅ **Definition of Done checklists**: Per-task DoD items with add/remove/check/uncheck
- ✅ **Board Visualization**: Terminal-based Kanban board (`backlog board`) and web UI (`backlog browser`)
- ✅ **Git Integration**: Automatic tracking of task states across branches
- ✅ **Dependencies**: Task relationships and subtask hierarchies
- ✅ **Documentation & Decisions**: Structured docs and architectural decision records
- ✅ **Export & Reporting**: Generate markdown reports and board snapshots
- ✅ **AI-Optimized**: `--plain` flag provides clean text output for AI processing

## Key Understanding

- **Tasks** live in `backlog/tasks/` as `task-<id> - <title>.md` files
- **You interact via CLI only**: `backlog task create`, `backlog task edit`, etc.
- **Use `--plain` flag** for AI-friendly output when viewing/listing
- **Never bypass the CLI** — It handles Git, metadata, file naming, and relationships

---

# ⚠️ CRITICAL: NEVER EDIT TASK FILES DIRECTLY. Edit Only via CLI

**ALL task operations MUST use the Backlog.md CLI commands**

- ✅ **DO**: Use `backlog task edit` and other CLI commands
- ✅ **DO**: Use `backlog task create` to create new tasks
- ✅ **DO**: Use `backlog task edit <id> --check-ac <index>` to mark acceptance criteria
- ❌ **DON'T**: Edit markdown files directly
- ❌ **DON'T**: Manually change checkboxes in files
- ❌ **DON'T**: Add or modify text in task files without using CLI

**Why?** Direct file editing breaks metadata synchronization, Git tracking, and task relationships.

---

## 1. Source of Truth & File Structure

### 📖 UNDERSTANDING (What you'll see when reading)

- Markdown task files live under **`backlog/tasks/`** (drafts under **`backlog/drafts/`**)
- Files are named: `task-<id> - <title>.md` (e.g., `task-42 - Add GraphQL resolver.md`)
- Project documentation is in **`backlog/docs/`**
- Project decisions are in **`backlog/decisions/`**

### 🔧 ACTING (How to change things)

- **All task operations MUST use the Backlog.md CLI tool**
- This ensures metadata is correctly updated and the project stays in sync
- **Always use `--plain` flag** when listing or viewing tasks for AI-friendly text output

---

## 2. Common Mistakes to Avoid

### ❌ WRONG: Direct File Editing

```markdown
# DON'T DO THIS:
1. Open backlog/tasks/task-7 - Feature.md in editor
2. Change "- [ ]" to "- [x]" manually
3. Add notes or final summary directly to the file
4. Save the file
```

### ✅ CORRECT: Using CLI Commands

```bash
# DO THIS INSTEAD:
backlog task edit 7 --check-ac 1  # Mark AC #1 as complete
backlog task edit 7 --notes "Implementation complete"
backlog task edit 7 --final-summary "PR-style summary"
backlog task edit 7 -s "In Progress" -a @agent-k
```

---

## 3. Understanding Task Format (Read-Only Reference)

⚠️ **FORMAT REFERENCE ONLY** — Never edit these directly! Use CLI commands.

### Task Structure You'll See

```markdown
---
id: task-42
title: Add GraphQL resolver
status: To Do
assignee: [@sara]
labels: [backend, api]
---

## Description
Brief explanation of the task purpose.

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 First criterion
- [x] #2 Second criterion (completed)
- [ ] #3 Third criterion
<!-- AC:END -->

## Definition of Done
<!-- DOD:BEGIN -->
- [ ] #1 Tests pass
- [ ] #2 Docs updated
<!-- DOD:END -->

## Implementation Plan
1. Research approach
2. Implement solution

## Implementation Notes
Progress notes captured during implementation.

## Final Summary
PR-style summary of what was implemented.
```

### How to Modify Each Section

| What You Want to Change | CLI Command to Use |
|---|---|
| Title | `backlog task edit 42 -t "New Title"` |
| Status | `backlog task edit 42 -s "In Progress"` |
| Assignee | `backlog task edit 42 -a @sara` |
| Labels | `backlog task edit 42 -l backend,api` |
| Description | `backlog task edit 42 -d "New description"` |
| Add AC | `backlog task edit 42 --ac "New criterion"` |
| Add DoD | `backlog task edit 42 --dod "Ship notes"` |
| Check AC #1 | `backlog task edit 42 --check-ac 1` |
| Check DoD #1 | `backlog task edit 42 --check-dod 1` |
| Uncheck AC #2 | `backlog task edit 42 --uncheck-ac 2` |
| Uncheck DoD #2 | `backlog task edit 42 --uncheck-dod 2` |
| Remove AC #3 | `backlog task edit 42 --remove-ac 3` |
| Remove DoD #3 | `backlog task edit 42 --remove-dod 3` |
| Add Plan | `backlog task edit 42 --plan "1. Step one\n2. Step two"` |
| Add Notes (replace) | `backlog task edit 42 --notes "What I did"` |
| Append Notes | `backlog task edit 42 --append-notes "Another note"` |
| Add Final Summary | `backlog task edit 42 --final-summary "PR-style summary"` |
| Append Final Summary | `backlog task edit 42 --append-final-summary "Another detail"` |
| Clear Final Summary | `backlog task edit 42 --clear-final-summary` |

---

## 4. Defining Tasks

### Creating New Tasks

```bash
backlog task create "Task title" -d "Description" --ac "First criterion" --ac "Second criterion"
```

### Title (one liner)

Use a clear brief title that summarizes the task.

### Description (The "why")

Provide a concise summary of the task purpose and its goal. Explains the context without implementation details.

### Acceptance Criteria (The "what")

**Managing Acceptance Criteria via CLI:**

⚠️ **IMPORTANT: How AC Commands Work**

- **Adding criteria (`--ac`)** accepts multiple flags: `--ac "First" --ac "Second"` ✅
- **Checking/unchecking/removing** accept multiple flags too: `--check-ac 1 --check-ac 2` ✅
- **Mixed operations** work in a single command: `--check-ac 1 --uncheck-ac 2 --remove-ac 3` ✅

```bash
backlog task edit 42 --ac "User can login" --ac "Session persists"
backlog task edit 42 --check-ac 1 --check-ac 2 --check-ac 3
backlog task edit 42 --check-ac 1 --uncheck-ac 2 --remove-ac 3
backlog task edit 42 --remove-ac 2 --remove-ac 4

# ❌ These formats do NOT work:
# backlog task edit 42 --check-ac 1,2,3   (no comma-separated)
# backlog task edit 42 --check-ac 1-3     (no ranges)
# backlog task edit 42 --check 1          (wrong flag name)
```

### Definition of Done checklist (per-task)

Defaults come from `definition_of_done` in `backlog/config.yml`. Can be disabled per task.

```bash
backlog task edit 42 --dod "Run tests" --dod "Update docs"
backlog task edit 42 --check-dod 1 --check-dod 2
backlog task edit 42 --uncheck-dod 1
backlog task edit 42 --remove-dod 2
backlog task create "Feature" --no-dod-defaults
```

**Key Principles for Good ACs:**

- **Outcome-Oriented:** Focus on the result, not the method
- **Testable/Verifiable:** Each criterion should be objectively testable
- **Clear and Concise:** Unambiguous language
- **User-Focused:** Frame from end-user or system behavior perspective

### Task Requirements

- Tasks must be **atomic** and **testable** or **verifiable**
- Each task should represent a single unit of work for one PR
- **Never** reference future tasks (only tasks with id < current task id)
- Ensure tasks are **independent** and don't depend on future work

---

## 5. Implementing Tasks

### 5.1. First step when implementing a task

The very first things you must do when you take over a task are:

```bash
backlog task edit 42 -s "In Progress" -a @{myself}
```

### 5.2. Review Task References and Documentation

Before planning, check if the task has any attached `references` or `documentation` — visible in `backlog task 42 --plain` output. Review them for context before drafting your plan.

### 5.3. Create an Implementation Plan (The "how")

Think about HOW to tackle the task and all its acceptance criteria. First check that all tools you need are available. Write the plan to the task.

```bash
backlog task edit 42 --plan "1. Research codebase\n2. Implement\n3. Test"
```

**After updating the plan, share it with the user and ask for confirmation. Do not begin coding until the user approves or explicitly says to skip review.**

### 5.4. Implementation

Follow the acceptance criteria one by one and MARK THEM AS COMPLETE as soon as you finish them.

### 5.5. Implementation Notes (Progress log)

Append notes progressively during implementation:

```bash
backlog task edit 42 --append-notes $'- Investigated root cause\n- Added tests for edge case'
```

### 5.6. Final Summary (PR description)

Write a clean PR-style summary when done. A one-liner is rarely enough unless the change is truly trivial.

```bash
backlog task edit 42 --final-summary "Implemented pattern X because Reason Y; updated files Z and W; added tests"
```

## Phase discipline: What goes where

- **Creation**: Title, Description, Acceptance Criteria, labels/priority/assignee
- **Implementation**: Plan (after moving to In Progress) + Notes (appended as you work)
- **Wrap-up**: Final Summary, verify AC and DoD checks, set status Done

**Only implement what's in the Acceptance Criteria.** If you need more scope:
1. Update the AC first: `backlog task edit 42 --ac "New requirement"`
2. Or create a follow-up task: `backlog task create "Additional feature"`

---

## 6. Typical Workflow

```bash
# 1. Identify work
backlog task list -s "To Do" --plain

# 2. Read task details
backlog task 42 --plain

# 3. Start work: assign yourself & change status
backlog task edit 42 -s "In Progress" -a @myself

# 4. Add implementation plan
backlog task edit 42 --plan "1. Analyze\n2. Refactor\n3. Test"

# 5. Share the plan with the user and wait for approval

# 6. Work on the task

# 7. Mark acceptance criteria as complete
backlog task edit 42 --check-ac 1 --check-ac 2 --check-ac 3

# 8. Add Final Summary
backlog task edit 42 --final-summary "Refactored using strategy pattern, updated tests"

# 9. Mark task as done
backlog task edit 42 -s Done
```

---

## 7. Definition of Done (DoD)

A task is **Done** only when ALL of the following are complete:

### ✅ Via CLI Commands:

1. **All acceptance criteria checked**: `backlog task edit <id> --check-ac <index>`
2. **All DoD items checked**: `backlog task edit <id> --check-dod <index>`
3. **Final Summary added**: `backlog task edit <id> --final-summary "..."`
4. **Status set to Done**: `backlog task edit <id> -s Done`

### ✅ Via Code/Testing:

5. Tests pass; linting clean
6. Documentation updated if needed
7. Self-reviewed; no regressions

⚠️ **NEVER mark a task as Done without completing ALL items above**

---

## 8. Finding Tasks and Content with Search

```bash
backlog search "auth" --plain
backlog search "login" --type task --plain
backlog search "api" --status "In Progress" --plain
backlog search "bug" --priority high --plain
```

Uses fuzzy matching. Always use `--plain` flag for AI-readable output.

---

## 9. Quick Reference: DO vs DON'T

| Task | ✅ DO | ❌ DON'T |
|---|---|---|
| View task | `backlog task 42 --plain` | Open .md file directly |
| List tasks | `backlog task list --plain` | Browse backlog/tasks folder |
| Find by topic | `backlog search "auth" --plain` | Manually grep through files |
| Check AC | `backlog task edit 42 --check-ac 1` | Change `- [ ]` to `- [x]` in file |
| Add notes | `backlog task edit 42 --notes "..."` | Type notes into .md file |
| Change status | `backlog task edit 42 -s Done` | Edit status in frontmatter |
| Add AC | `backlog task edit 42 --ac "New"` | Add `- [ ] New` to file |

---

## 10. Complete CLI Command Reference

### Task Creation

| Action | Command |
|---|---|
| Create task | `backlog task create "Title"` |
| With description | `backlog task create "Title" -d "Description"` |
| With AC | `backlog task create "Title" --ac "Criterion 1" --ac "Criterion 2"` |
| With final summary | `backlog task create "Title" --final-summary "PR-style summary"` |
| With references | `backlog task create "Title" --ref src/api.ts --ref https://github.com/issue/123` |
| With documentation | `backlog task create "Title" --doc https://design-docs.example.com` |
| With all options | `backlog task create "Title" -d "Desc" -a @sara -s "To Do" -l auth --priority high --ref src/api.ts --doc docs/spec.md` |
| Create draft | `backlog task create "Title" --draft` |
| Create subtask | `backlog task create "Title" -p 42` |

### Task Modification

| Action | Command |
|---|---|
| Edit title | `backlog task edit 42 -t "New Title"` |
| Edit description | `backlog task edit 42 -d "New description"` |
| Change status | `backlog task edit 42 -s "In Progress"` |
| Assign | `backlog task edit 42 -a @sara` |
| Add labels | `backlog task edit 42 -l backend,api` |
| Set priority | `backlog task edit 42 --priority high` |

### Acceptance Criteria Management

| Action | Command |
|---|---|
| Add AC | `backlog task edit 42 --ac "New criterion" --ac "Another"` |
| Remove AC #2 | `backlog task edit 42 --remove-ac 2` |
| Remove multiple ACs | `backlog task edit 42 --remove-ac 2 --remove-ac 4` |
| Check AC #1 | `backlog task edit 42 --check-ac 1` |
| Check multiple ACs | `backlog task edit 42 --check-ac 1 --check-ac 3` |
| Uncheck AC #3 | `backlog task edit 42 --uncheck-ac 3` |
| Mixed operations | `backlog task edit 42 --check-ac 1 --uncheck-ac 2 --remove-ac 3 --ac "New"` |

### Task Content

| Action | Command |
|---|---|
| Add plan | `backlog task edit 42 --plan "1. Step one\n2. Step two"` |
| Add notes | `backlog task edit 42 --notes "Implementation details"` |
| Append notes | `backlog task edit 42 --append-notes "Progress update"` |
| Add final summary | `backlog task edit 42 --final-summary "PR-style summary"` |
| Append final summary | `backlog task edit 42 --append-final-summary "More details"` |
| Clear final summary | `backlog task edit 42 --clear-final-summary` |
| Add dependencies | `backlog task edit 42 --dep task-1 --dep task-2` |
| Add references | `backlog task edit 42 --ref src/api.ts --ref https://github.com/issue/123` |
| Add documentation | `backlog task edit 42 --doc https://design-docs.example.com --doc docs/spec.md` |

### Multi-line Input (Description/Plan/Notes/Final Summary)

The CLI preserves input literally. Use one of the following to insert real newlines:

- **PowerShell** (backtick n): `` backlog task edit 42 --notes "Line1`nLine2" ``
- **Bash/Zsh** (ANSI-C quoting): `backlog task edit 42 --notes $'Line1\nLine2'`
- **POSIX portable**: `backlog task edit 42 --notes "$(printf 'Line1\nLine2')"`

Do not expect `"...\n..."` to become a newline — that passes a literal backslash+n.

### Implementation Notes Formatting

- Concise and time-ordered; focus on progress, decisions, and blockers
- Use Markdown bullets for readability
- Use `--append-notes` to preserve history; never use `--notes` after the first entry

### Final Summary Formatting

Treat as a PR description: lead with the outcome, then key changes and tests.
Aim to cover: **what changed**, **why**, **user impact**, **tests run**, **risks/follow-ups**.

### Task Operations

| Action | Command |
|---|---|
| View task | `backlog task 42 --plain` |
| List tasks | `backlog task list --plain` |
| Search tasks | `backlog search "topic" --plain` |
| Search with filter | `backlog search "api" --status "To Do" --plain` |
| Filter by status | `backlog task list -s "In Progress" --plain` |
| Filter by assignee | `backlog task list -a @sara --plain` |
| Archive task | `backlog task archive 42` |
| Demote to draft | `backlog task demote 42` |

---

## Common Issues

| Problem | Solution |
|---|---|
| Task not found | Check task ID with `backlog task list --plain` |
| AC won't check | Use correct index: `backlog task 42 --plain` to see AC numbers |
| Changes not saving | Ensure you're using CLI, not editing files |
| Metadata out of sync | Re-edit via CLI: `backlog task edit 42 -s <current-status>` |

---

## The Golden Rule

**🎯 If you want to change ANYTHING in a task, use the `backlog task edit` command.**
**📖 Use CLI to read tasks; exceptionally READ task files directly, never WRITE to them.**

Full help available: `backlog --help`
