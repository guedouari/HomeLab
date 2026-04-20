# Monitoring — Decision Index

## Role

Provide a simple visual overview of the server's service health:
1. **At-a-glance status** — single dashboard showing which services are up or down
2. **Incident history** — when did something go down and for how long
3. **Notifications** — alert when a service goes down (optional at Layer 0)

One container, self-contained. No agents, no sidecars.

---

## Status

✅ **Verified** — `twinproduction/gatus` tested and passing. See [testing.md](testing.md) for results.

**Selected image:** `twinproduction/gatus:latest`
**Digest:** `sha256:ce650981b5018de1c9e725f1c64015f9051e21e1a4d2bc9eea70dee0d51e7c40`

---

## Sections

| File | Contents |
|------|----------|
| [candidates.md](candidates.md) | Candidate comparison — why Gatus was chosen |
| [networking.md](networking.md) | Docker networking modes, port considerations |
| [configuration.md](configuration.md) | Config file structure, monitor types, notifications |
| [testing.md](testing.md) | Verification checklist and results |
| [horizon.md](horizon.md) | Out-of-scope ideas: Prometheus/Grafana, public status pages |

---

## Constraints

- Single container, no sidecars
- Config-file driven (reproducible — no first-run wizard or DB)
- ARM64 required (Raspberry Pi target)
- Lightest acceptable footprint
- HTTP, TCP, DNS monitor types required
