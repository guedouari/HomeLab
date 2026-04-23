---
id: decision-3
title: Generator Testing Strategy — golden-file tests
date: '2026-04-23 10:28'
status: Accepted
---
## Context

The generator produces Docker Compose YAML and `.env` files. These outputs must be correct and stable — regressions in generated config can break user deployments. A unit-test-only approach would not catch full output correctness.

## Decision

Generator output is validated with golden-file tests: the generator runs against a known `GeneratorInput` fixture and the output must match reference configs exactly. Tests use Vitest and run as part of `npm test`. The golden files are the reference configs in `examples/` (one per layer). Any intentional change to generated output requires updating the golden files deliberately.

## Consequences

Regressions in generated output are caught automatically. The `examples/` directory serves double duty as both a runnable reference stack and the test oracle. Golden-file diffs in PRs make output changes explicit and reviewable.
