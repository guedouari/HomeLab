---
id: doc-2
title: Implementation Roadmap
---

# HomeLab — Implementation Plan

**Updated:** 2026-04-23

---

## Core Concept

A **Docker Compose config generator** for self-hosted home servers, with primary focus on the Steam Machine use case (x86_64 PC running games + home services). Configs are organised as four additive layers of capability. The generator evolves into a manager and eventually a web UI.

**Design principles (in priority order):**
1. Lighter is better — fewer containers, smaller images, less to operate
2. File config over wizard/UI — full configuration in version-controlled files
3. Evaluate before committing — no service added without verified use case + tested image
4. FOSS first (Steam/gaming is the one explicit exception)
5. ARM64 support required for every included image

**These principles govern implementation choices — image selection is a local concern decided during each implementation task, not in the plan.**

---

## Three Deliverables (built in order)

1. **Reference Stack** — polished, user-deployable Docker Compose configs for all four layers
2. **Config Generator + CLI** — TypeScript library + CLI that produces the reference configs from validated inputs
3. **Web UI** — GitHub Pages static site powered by the same generator library (closing milestone)

**Architecture constraint:** Generator core has zero Node.js imports → runs identically in Node.js (CLI) and in the browser (GitHub Pages static site).

---

## Explicitly Out of Scope

Permanent exclusions — not deferred, not horizons:

| Excluded | Reason |
|----------|--------|
| **Immich** | Permanently removed from the project |
| **Redis / Valkey** | No current use case; not needed |
| **pgvector** | No current use case; not needed |
| **Kubernetes / Helm** | Compose is the deployment primitive for this project |
| **Multi-user SaaS** | Single-user self-hosted deployment only |

---

## Phase 0 — Strategy & Concepts Verification

**Goal:** Confirm the project's design foundation is accurate and consistently documented before any implementation work. No code.

| # | Task | Status |
|---|------|--------|
| 0.1 | **Audit all 11 architecture decisions** — review each for accuracy, completeness, and consistency with current project state | 📋 To Do |
| 0.2 | **Update project strategy** — verify all principles reflect current reality; remove or correct anything stale or contradictory | 📋 To Do |
| 0.3 | **Formalise exclusions** — document what is permanently out of scope and why (prevents recurring confusion) | 📋 To Do |
| 0.4 | **Confirm layer model** — verify the four-layer capability model has no gaps or ambiguous scope boundaries | 📋 To Do |

---

## Phase 1 — Reference Stack Polish

**Goal:** Each layer's compose config is clean, production-quality, and paired with a user-facing deployment guide. Users should be able to deploy the output without reading source code.

**What polish means (concepts, not images):**
- Every compose option is explained — no magic values
- Every env variable is documented with purpose and example
- The config deploys cleanly on a standard Docker install
- It also works on Docker-compatible runtimes — verified as a quality check

**Documentation evolution:** `docs/setup/` guides are rewritten from developer-focused into user-facing deployment guides. A user who wants to run Layer 2 should find everything they need there.

Each layer is a **milestone**. Layer N must be complete before Layer N+1 begins.

---

### Milestone 1.0 — Layer 0 · LAN Capabilities

*DNS filtering, local file sharing, lightweight monitoring — LAN-only, no internet exposure.*

| # | Task | Backlog ID |
|---|------|-----------|
| 1.0.1 | Audit Layer 0 compose config — formatting, comments, env var documentation | *(new)* |
| 1.0.2 | Finish Windows deployment guide — user-facing guide for deploying the LAN stack on Windows | BACK-7 |
| 1.0.3 | Verify Layer 0 on a Docker-compatible runtime — confirm portability; document any runtime-specific workarounds | BACK-10 |

---

### Milestone 1.1 — Layer 1 · WAN Capabilities

*VPN access from outside, hardened perimeter, split-horizon DNS.*

| # | Task |
|---|------|
| 1.1.1 | Audit Layer 1 compose config |
| 1.1.2 | Verify Layer 1 portability — confirm network stack capabilities (kernel modules, capabilities) translate correctly |
| 1.1.3 | Update deployment guides for WAN layer |

---

### Milestone 1.2 — Layer 2 · Domain Capabilities

*Public domain name, TLS, reverse proxy, on-demand container startup.*

| # | Task |
|---|------|
| 1.2.1 | Audit Layer 2 compose config |
| 1.2.2 | Verify Layer 2 portability — proxy and on-demand manager may need socket adaptation on non-Docker runtimes |
| 1.2.3 | Update deployment guides for Domain layer |

---

### Milestone 1.3 — Layer 3 · Service Capabilities

*Self-hosted user services replacing cloud dependencies (files, contacts, calendar, photos).*

| # | Task | Backlog ID |
|---|------|-----------|
| 1.3.1 | Audit Layer 3 compose config | *(new)* |
| 1.3.2 | Verify Layer 3 portability — confirm rootless capability requirements are met | *(new)* |
| 1.3.3 | Write portability compatibility summary — consolidated findings across all layers | BACK-10 |
| 1.3.4 | Update deployment guides for Services layer | *(new)* |

---

## Phase 2 — Config Generator

**Goal:** The generator produces exactly the reference configs from validated inputs. The generator eventually becomes the source of truth; reference configs are generated output, not hand-crafted files.

**Approach:** Code-first TypeScript — no external template files; TS builds YAML/env strings directly.  
**Testing:** Golden-file tests — generator output must match reference configs exactly.  
**Browser compat:** Core library (`src/core/`) has zero Node.js imports; CLI wraps it with `node:fs`.

Each layer is a **milestone**. Complete Layer N generator before Layer N+1.

---

### Milestone 2.0 — Generator Foundation

| # | Task | Backlog ID |
|---|------|-----------|
| 2.0.1 | Complete generator input schema — audit all layer configs for inputs not yet covered; add missing fields | BACK-2 |
| 2.0.2 | Restructure as isomorphic library — `src/core/` (pure TS), `src/cli/` (thin Node.js wrapper), `src/web/` (browser entry point placeholder) | *(new)* |

---

### Milestone 2.1 — Layer 0 Generator

| # | Task | Backlog ID |
|---|------|-----------|
| 2.1.1 | Implement Layer 0 generator — produce compose + env for all LAN capabilities | BACK-3 |
| 2.1.2 | Golden-file tests for Layer 0 — assert output matches reference config exactly | *(new)* |

---

### Milestone 2.2 — Layer 1 Generator

| # | Task |
|---|------|
| 2.2.1 | Implement Layer 1 generator — extend Layer 0 with WAN capabilities |
| 2.2.2 | Golden-file tests for Layer 1 |

---

### Milestone 2.3 — Layer 2 Generator

| # | Task |
|---|------|
| 2.3.1 | Implement Layer 2 generator — extend Layer 1 with Domain capabilities |
| 2.3.2 | Golden-file tests for Layer 2 |

---

### Milestone 2.4 — Layer 3 Generator

| # | Task |
|---|------|
| 2.4.1 | Implement Layer 3 generator — extend Layer 2 with Service capabilities |
| 2.4.2 | Golden-file tests for Layer 3 |
| 2.4.3 | Migrate reference configs to generated output — reference configs become a CI artifact; hand-crafted files removed |

---

### Milestone 2.5 — Interactive CLI Wizard

| # | Task | Backlog ID |
|---|------|-----------|
| 2.5.1 | Interactive prompt wizard — guided input flow (hardware → layer → network → credentials) | BACK-5 |

---

## Phase 3 — Manager / Editor Mode

**Goal:** The generator reads an existing deployed config as input, enabling users to update a live deployment without losing customisations. It becomes a config manager, not just a generator.

| # | Task |
|---|------|
| 3.1 | Read-back — parse existing compose + env files back into the generator's input model |
| 3.2 | Diff mode — show what the generator would change vs current deployed files, before applying |
| 3.3 | Apply mode — regenerate only changed files; preserve intentional manual overrides |

---

## Phase 4 — Git Sync

**Goal:** Push/pull config files to/from a private Git repository. Provider-agnostic design — any Git host works via pluggable adapters. Must run in both Node.js and the browser.

| # | Task |
|---|------|
| 4.1 | Define `GitProvider` interface — abstract operations: push, pull, status |
| 4.2 | GitHub adapter — GitHub REST API (Octokit); isomorphic (Node.js + browser) |
| 4.3 | CLI sync commands — `homelab sync push / pull / status` |

*Additional provider adapters (GitLab, Gitea/Forgejo, etc.) follow the same interface and can be added independently.*

---

## Phase 5 — Web UI *(Closing Milestone)*

**Goal:** A GitHub Pages static site powered by the generator library. No backend required. Users configure their stack, get a live preview, and either download a zip or push directly to their private repo via the Git sync interface.

| # | Task |
|---|------|
| 5.1 | GitHub Pages project + CI — framework selection, deploy pipeline |
| 5.2 | Input form — mirrors the generator's input model; shows only relevant fields per layer |
| 5.3 | Live preview pane — compose + env output rendered in real time as the user types |
| 5.4 | Download bundle — zip of all generated files |
| 5.5 | Git sync in UI — connect to private repo via token, push generated files |
| 5.6 | Editor mode — load existing config from repo, show diff, apply changes |

---

## Open Questions

- **Schema completeness:** Which exact fields are missing? Needs a systematic audit of all layer configs.
- **Golden test runner:** Part of `npm test` (Vitest) or a separate `npm run test:golden`?
- **Output directory structure:** Flat `output/` vs per-layer subdirs (`output/lan/`, `output/wan/`, etc.)?
- **Override file format:** How are manual overrides preserved in Apply mode?
- **Web UI framework:** Decision deferred to Phase 5.

---

## Horizon *(visibility only — nothing here is planned for the current cycle)*

- **Multi-node / VPS** — home server + public relay node; VPN mesh; per-node config generation
- **Additional Layer 3 services** — each evaluated independently per the project principles; no list maintained here to avoid premature commitment
- **Mobile companion** — same generator library in a mobile shell
- **Alternative Git provider adapters** — trivial once the interface is defined
