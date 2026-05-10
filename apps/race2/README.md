# Pravěk Race App

Samostatná aplikace v monorepu pro závodníky a administraci závodu.

## Funkce MVP

- UUID pro všechny hlavní entity.
- Event-driven stav závodníka přes `RaceEvent`.
- Read model `RacerRaceState` pro rychlý dashboard.
- Mobilní PWA/web pro závodníka přes unikátní token `/r/[token]`.
- Admin login lokálním účtem.
- Správa závodů, checkpointů a závodníků.
- Import závodníků z Google Sheets s filtrem ročníku, zaplaceno, potvrzeno.
- Deduplikace podle e-mailu, telefonu nebo obojího.
- Fotky závodníka přes Impossible Cloud S3.
- SMS adapter: mock nebo BulkGate.
- SMS segmentace podle aktuálního úseku trasy.

## Instalace

Z rootu monorepa:

```bash
pnpm install
pnpm --filter race prisma:generate
pnpm --filter race prisma:migrate
pnpm --filter race seed
pnpm --filter race dev
```

Aplikace běží na:

```txt
http://localhost:3001
```

## Environment

Zkopíruj `.env.example` do `.env` v `apps/race` a vyplň hodnoty.

```bash
cp apps/race/.env.example apps/race/.env
```

## Google Sheets import

Aplikace očekává jeden list pro registrace. Název listu nastavíš přes:

```env
SHEET_NAME_RACERS="Registrace"
```

Podporované názvy sloupců jsou tolerantní, například:

- `rocnik`, `ročník`, `year`
- `email`, `e-mail`, `mail`
- `phone`, `telefon`, `mobile`, `mobil`
- `zaplaceno`, `paid`
- `potvrzeno`, `confirmed`
- `startovni_cislo`, `startovní číslo`, `startNumber`
- `trasa`, `route`

## Impossible Cloud S3

Fotky se ukládají do privátního bucketu. Do DB se ukládá `objectKey`, ne binární soubor.

```txt
races/{raceId}/racers/{racerId}/photos/{photoId}.jpg
```

## SMS

Výchozí režim je mock:

```env
SMS_PROVIDER="mock"
```

Pro BulkGate:

```env
SMS_PROVIDER="bulkgate"
BULKGATE_APPLICATION_ID="..."
BULKGATE_APPLICATION_TOKEN="..."
BULKGATE_SENDER_ID="Pravek"
```
