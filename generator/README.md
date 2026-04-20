# HomeLab Generator

TypeScript CLI that generates ready-to-deploy Docker Compose + `.env` configs for the HomeLab stack.

## Status

🚧 **In development** — schema and CLI skeleton are in place; layer generators are stubs (tracked in [`backlog/`](../backlog/)).

## Install & run

```bash
cd generator
npm install
npm run dev -- generate --help
```

## Usage

```bash
homelab generate \
  --hardware x86_64 \
  --layer 0 \
  --server-ip 192.168.1.10 \
  --timezone Europe/Paris \
  --out ./my-homelab
```

For Layer 1+, add `--vpn-subnet 10.8.0.0/24`.  
For Layer 2+, add `--domain home.example.com --cloudflare-token <token> --acme-email admin@example.com`.  
For Layer 3, add Nextcloud + Postgres credentials.

## Architecture

```
generator/
├── src/
│   ├── index.ts      # CLI entry point (Commander)
│   ├── schema.ts     # Zod input schema + GeneratorInput type
│   └── generate.ts   # Orchestrator — calls layer-specific generators
├── package.json
└── tsconfig.json
```

Each layer will be implemented in its own module (`src/layers/lan.ts`, `wan.ts`, etc.) and called from `generate.ts`.

## Development

```bash
npm run typecheck   # type-check without building
npm run build       # compile to dist/
npm run dev -- generate --hardware x86_64 --layer 0 --server-ip 192.168.1.10 --timezone UTC --out ./test-output
```
