---
id: decision-2
title: 'Generator Architecture — code-first TypeScript, isomorphic core'
date: '2026-04-23 10:28'
status: Accepted
---
## Context

The generator must run in two environments: Node.js (CLI, Phase 2) and the browser (GitHub Pages static site, Phase 5). A template-file approach would couple the generator to the filesystem and make browser execution impractical.

## Decision

The generator is implemented as code-first TypeScript with no external template files. All compose and env content is produced by pure functions. The core library (`src/core/`) has zero Node.js imports so it runs identically in Node.js and in the browser. The CLI (`src/cli/`) wraps the core with `node:fs` for file I/O. The web entry point (`src/web/`) is a placeholder for Phase 5.

## Consequences

The isomorphic core can be bundled for GitHub Pages without modification. Testing is straightforward: call the core functions directly and compare output. Adding a new layer generator means adding a new pure function, not a new template file.
