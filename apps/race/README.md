# Pravěk Race App

Kompletní samostatná aplikace `apps/race` pro monorepo Pravek2025.

Obsahuje:
- admin login
- CRUD checkpointů
- editaci závodníků
- historii průchodů
- QR/token check-in
- offline checkpoint frontu
- fullscreen checkpoint board
- SSE admin live endpoint
- veřejný live board
- export výsledků
- mezičasy
- dynamické SMS segmenty
- incident management
- design podle Pravěk v Ráji
- Google Sheets import
- Impossible Cloud S3 foto upload

## Spuštění

```bash
pnpm install
pnpm --filter race prisma:push
pnpm --filter race seed
pnpm --filter race dev
```

Vercel Root Directory: `apps/race`.
