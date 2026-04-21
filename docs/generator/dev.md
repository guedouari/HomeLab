# Generator — Developer Guide

The generator is a TypeScript CLI at the project root (`src/`). It produces ready-to-deploy Docker Compose + `.env` files from user inputs.

---

## Setup

```bash
npm install
```

---

## Development

Run the CLI directly with `tsx` (no build step needed):

```bash
npm run dev -- generate --help
npm run dev -- generate --layers lan --hostname myserver
```

`npm run dev` runs `tsx src/index.ts` — changes are picked up immediately.

---

## Type Checking

```bash
npm run typecheck
```

Runs `tsc --noEmit`. Must pass cleanly before committing.

---

## Building

```bash
npm run build
```

Outputs to `dist/`. Not required for local development.

---

## Testing

Tests use [Vitest](https://vitest.dev) — fast, TypeScript-native, no config needed for a CommonJS project.

### Install

```bash
npm install -D vitest
```

Add to `package.json` scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

### Writing Tests

Place test files alongside source as `*.test.ts`:

```
src/
  schema.ts
  schema.test.ts      ← validates Zod schema edge cases
  generate.ts
  generate.test.ts    ← snapshot tests for generated compose output
```

### Run

```bash
npm test             # single run
npm run test:watch   # watch mode during development
```

---

## Project Structure

```
src/
  index.ts       # CLI entry point (Commander) — flags → GeneratorInput
  schema.ts      # Zod schema + GeneratorInput type + cross-field validation
  generate.ts    # Orchestrator — calls per-layer generators
package.json
tsconfig.json    # CommonJS, ES2022, strict
```

---

## Key Design Rules

- **Schema-first**: all inputs go through the Zod `GeneratorInput` schema before reaching any generator function.
- **No side effects in generators**: generator functions return file content as strings — the CLI (`index.ts`) handles writing to disk.
- **One compose file per layer**: `generate()` returns a map of `{ filename → content }`.
