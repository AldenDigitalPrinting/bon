# Project Documentation — `bon`

> Aplikasi Pencatatan Bon Multi-Profil (Indonesian multi-profile debt/credit recording app)
> for **Alden Digital Printing** (a digital printing shop). This document is intended to be fed
> to an AI agent for further questioning, particularly about **deployment**.

---

## 1. Project at a Glance

| Field          | Value                                                                                                                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project name   | `bon`                                                                                                                                                                                                                                       |
| Repository     | `https://github.com/AldenDigitalPrinting/bon`                                                                                                                                                                                               |
| Purpose        | Record and track debts / credits (`bon`/`piutang`) owed by institutions (e.g., schools "SD", village offices "Kantor Desa", shops "Toko A") to a printing shop. Each institution is a separate **Profile** with its own transaction ledger. |
| Current status | **Not yet deployed.** Development is complete on feature branches; `master` holds merged, buildable features. No CI/CD, no hosting config, no Dockerfile, no `vercel.json`.                                                                 |
| Primary branch | `master` (production-ready), `dev` (working branch)                                                                                                                                                                                         |
| Language       | Indonesian (UI copy is a mix of English and Indonesian)                                                                                                                                                                                     |
| Currency       | Indonesian Rupiah (IDR), stored as integer amounts                                                                                                                                                                                          |
| Users          | No authentication. Single-user / internal tool.                                                                                                                                                                                             |

---

## 2. Tech Stack & Versions

| Layer             | Technology                                                            | Version                       |
| ----------------- | --------------------------------------------------------------------- | ----------------------------- |
| Framework         | Next.js (App Router)                                                  | `16.2.10`                     |
| UI                | React                                                                 | `19.2.4`                      |
| Language          | TypeScript                                                            | `^5` (strict mode)            |
| Styling           | Tailwind CSS                                                          | `^4` (`@tailwindcss/postcss`) |
| UI kit            | shadcn/ui (Base UI based, style `base-nova`)                          | `^4.13.1`                     |
| UI primitives     | `@base-ui/react`                                                      | `^1.6.0`                      |
| Data table        | `@tanstack/react-table`                                               | `^8.21.3`                     |
| Dates             | `date-fns`, `react-day-picker`                                        | `^4.4.0`, `^10.0.1`           |
| Icons             | `lucide-react`                                                        | `^1.25.0`                     |
| Toasts            | `sonner`                                                              | `^2.0.7`                      |
| Themes            | `next-themes` (installed, but theme is **forced dark** in the layout) | `^0.4.6`                      |
| ORM               | Prisma                                                                | `^7.9.0`                      |
| DB driver adapter | `@prisma/adapter-pg` + `pg` (node-postgres)                           | `^7.9.0` / `^8.22.0`          |
| Database          | PostgreSQL                                                            | — (local dev: localhost:5432) |
| Package manager   | **pnpm** (v10.25.0 local; workspace + lockfile)                       | `pnpm-lock.yaml`              |
| Node runtime      | Node `v24.12.0` locally (Next 16 requires Node ≥ 20.9)                | —                             |

**Important:** This is a **brand-new Next.js 16 / Prisma 7 / Tailwind 4 / React 19** stack that
differs from older documentation in an AI agent's training data. The repo's `AGENTS.md` explicitly
warns: _"This is NOT the Next.js you know — APIs, conventions, and file structure may all differ
from your training data."_ Read the bundled docs in `node_modules/next/dist/docs/` before assuming
behavior. Same caution applies to Prisma 7 (driver adapters, `prisma.config.ts`) and Tailwind 4.

---

## 3. Prerequisites

- **Node.js** ≥ 20.9 (project developed on v24.12.0)
- **pnpm** ≥ 9/10 (lockfile is pnpm's; do not use npm/yarn for installs)
- **PostgreSQL** database (dev: local Postgres on `localhost:5432`)
- Network access at build time (Next.js downloads Google Fonts — Geist/Geist Mono/Inter — during `next build`)

---

## 4. Environment Variables

Only **one** env var is actually read by the app:

| Variable       | Used by                                                             | Required                                          |
| -------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `DATABASE_URL` | `lib/prisma.ts` (Prisma client) and `prisma.config.ts` (Prisma CLI) | ✅ Yes — app crashes without a reachable Postgres |

Format: standard PostgreSQL connection string, e.g.
`postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require`

Notes:

- `.env*` files are **gitignored** — the `.env` in the repo folder is local-only and must be
  replicated as platform env vars on the deployment host. The app only ever reads
  `process.env.DATABASE_URL`.
- The current local `.env` points at a local Postgres
  (`postgresql://postgres:****@localhost:5432/aldendigitalprinting?schema=public`). A commented-out
  line contains a **Neon** serverless Postgres connection string, indicating Neon was tried/considered.
- `process.env.NODE_ENV` is used only to guard the dev-only seeding route and to skip Prisma
  client hot-reload caching in production. No other env vars exist.

---

## 5. Project Structure

```
bon/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — forced `dark` theme, Google Fonts, sonner <Toaster/>
│   ├── loading.tsx             # Root loading spinner
│   ├── page.tsx                # "/" — list of Profiles + create-profile dialog
│   ├── actions.ts              # ALL server actions (CRUD for profiles & transactions)
│   ├── globals.css             # Tailwind 4 CSS entry
│   ├── profile/[id]/
│   │   ├── page.tsx            # Profile detail: header + <TransactionDataTable/>
│   │   ├── layout.tsx          # Passthrough layout
│   │   ├── columns.tsx         # TanStack Table column defs + IDR formatter
│   │   ├── transactions-table.tsx  # Client table w/ filters, pagination, page-size
│   │   ├── date-range-picker.tsx   # react-day-picker date range filter
│   │   └── new/                # "New Record" form
│   │       ├── page.tsx        # Fetches profile + latest accumulation, renders form
│   │       ├── new-record-form.tsx  # Add Debt / Pay Debt form w/ live preview
│   │       └── date-picker.tsx
│   │   └── settings/           # Profile settings
│   │       ├── page.tsx
│   │       └── settings-form.tsx    # Rename + delete profile (danger zone)
│   └── dev/                    # ⚠️ DEV-ONLY tools (guarded to NODE_ENV=development)
│       ├── page.tsx            # "/dev" seeder UI
│       ├── transaction-seeder-form.tsx
│       └── actions.ts          # createDummyTransactions + SQL accumulation recalc
├── components/
│   ├── create-profile-dialog.tsx
│   ├── delete-profile.dialog.tsx
│   ├── pagination-input.tsx
│   └── ui/                     # shadcn/ui components (button, dialog, table, select, ...)
├── lib/
│   ├── prisma.ts               # PrismaClient singleton w/ PrismaPg driver adapter
│   └── utils.ts                # cn() helper
├── prisma/
│   ├── schema.prisma
│   └── migrations/             # 3 committed migrations
├── prisma.config.ts            # Prisma CLI config (dotenv + migrations path) — at root
├── public/                     # Default Next.js SVG assets
├── next.config.ts              # EMPTY config (no custom settings)
├── tsconfig.json               # strict TS, `@/*` path alias → project root
├── components.json             # shadcn config
├── eslint.config.mjs           # eslint-config-next (core-web-vitals + typescript)
├── pnpm-workspace.yaml         # ignores postinstall builds for sharp + unrs-resolver
└── .env                        # LOCAL ONLY (gitignored) — contains DATABASE_URL
```

There are **no API routes** (`app/api`), **no middleware**, **no `instrumentation.ts`**, and **no
`next/image` usage** — all data mutations go through **Server Actions**.

---

## 6. Data Model (Prisma)

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Profile {
  id            String        @id @default(uuid())
  name          String        @unique
  createdAt     DateTime      @default(now())
  transactions  Transaction[]
}

model Transaction {
  id            String    @id @default(uuid())
  profileId     String
  profiles      Profile   @relation(fields: [profileId], references: [id], onDelete: Cascade)

  date          DateTime  @default(now())
  personName    String
  itemName      String
  itemQuantity  Int?      // optional (null = service/job, not per-unit)
  itemPrice     Int?      // per-unit price; null when payment row
  debtAdded     Int       // amount added to debt (qty × price, or price if qty null)
  debtPaid      Int       // amount paid
  accumulation  Int       // running balance = prev accumulation + debtAdded - debtPaid
  createdAt     DateTime  @default(now())
}
```

Key facts:

- **Money is stored as integer Rupiah** (no decimals, no `Decimal` type).
- `accumulation` is **denormalized** (stored per row, not computed at read time).
- `Profile.name` is unique (constraint `P2002` handled in server actions).
- Deleting a `Profile` cascades to its transactions (`onDelete: Cascade`).
- The `datasource` block has **no `url`** — the URL is injected at runtime/CLI time
  (`prisma.config.ts` for the CLI, `lib/prisma.ts` for the app).

**Migrations** (all committed, provider locked to `postgresql` in `migration_lock.toml`):

| Migration                                        | Change                                         |
| ------------------------------------------------ | ---------------------------------------------- |
| `20260721032732_init_tabel_bon`                  | Create `Profile` and `Transaction` tables + FK |
| `20260723162832_add_accumulation_to_transaction` | Add `accumulation INTEGER NOT NULL DEFAULT 0`  |
| `20260723163247_remove_accumulation_default`     | Drop the default on `accumulation`             |

---

## 7. Application Architecture

### 7.1 Database access — Prisma 7 driver adapter (key for deployment)

`lib/prisma.ts`:

```ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- Uses the **`@prisma/adapter-pg` driver adapter** (Prisma 7's default architecture — **no Rust
  query engine binary** is shipped; queries run through a TypeScript query compiler + the `pg`
  driver). This is a big deal for deployment: it runs on standard Node servers and on
  serverless/edge-compatible runtimes without engine-binary headaches.
- The client is a **singleton** cached on `globalThis` in dev (avoids connection exhaustion on hot
  reload).
- `prisma generate` outputs the client to `node_modules/@prisma/client` (verified with
  `prisma generate` under the `prisma-client-js` generator — the `app/generated/prisma` entry in
  `.gitignore` is stale and does not match current behavior).

### 7.2 Server Actions — `app/actions.ts`

All mutations/fetches are Server Actions (`"use server"`). Exported functions:

| Action                                                                                                                                   | Purpose                                                                                                     | Revalidates               |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------- |
| `getProfiles()`                                                                                                                          | List all profiles (asc `createdAt`)                                                                         | —                         |
| `createProfile(name)`                                                                                                                    | Create profile; handles unique-name `P2002`                                                                 | `/`                       |
| `deleteProfile(id)`                                                                                                                      | Delete profile (cascade removes transactions)                                                               | `/`                       |
| `updateProfile(id, name)`                                                                                                                | Rename profile                                                                                              | `/profile/[id]`, settings |
| `getTransactionsWithAccumulation(profileId, page, pageSize, searchPersonName?, searchItemName?, startDate?, endDate?, transactionType?)` | Paginated, filterable transaction query (case-insensitive `contains`, date-range, debt/payment type filter) | —                         |
| `createTransaction({profileId, personName, itemName, itemPrice, date, itemQuantity, debtAdded, debtPaid})`                               | Insert transaction, computing `accumulation` from the latest prior row                                      | `/profile/[id]`           |

Notes:

- Every action has a `sleep()` no-op delay (artificial latency to exercise loading states) —
  harmless in production but adds a tiny delay to all calls.
- Actions return `{ success, data | error }` tuples rather than throwing.
- `getTransactionsWithAccumulation` is **server-side paginated** (the client table is "manual
  pagination"); default page size 10, options 10/25/50/75/100.

### 7.3 Pages & UX behavior

| Route                    | Behavior                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                      | Server component. Renders a button per profile (link to `/profile/[id]`) + create-profile dialog. Loading state via `app/loading.tsx`.                                                                                                                                                                                                                         |
| `/profile/[id]`          | Server component; `notFound()` if profile missing. Header (back, title, settings icon, "Add Record") + `TransactionDataTable` (client). Table defaults to **last page** (most recent rows), supports: person-name search (debounced 300 ms), item-name search, date-range picker, debt/payment type toggle, pagination, page-size selector, clear-all-filters. |
| `/profile/[id]/new`      | Server component; reads profile + latest `accumulation`. `NewRecordForm` (client): radio **Add Debt / Pay Debt**. Live preview card shows previous accumulation, debt added/paid, final accumulation. Client-side validation, sonner toasts, redirects back to the profile after submit.                                                                       |
| `/profile/[id]/settings` | Rename profile + **Danger Zone** delete (confirm dialog).                                                                                                                                                                                                                                                                                                      |
| `/dev`                   | **Dev-only** transaction seeder. Guarded: actions call `notFound()` unless `NODE_ENV === "development"`. Seeds faker-generated transactions and recalculates accumulation via a single raw-SQL window function. Not reachable in production.                                                                                                                   |

### 7.4 Business logic — accumulation

`createTransaction` computes the new row's running balance:

```ts
const latest = await prisma.transaction.findFirst({
    where: { profileId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }, { id: "desc" }],
});
const previousAccumulation = latest?.accumulation ?? 0;
const accumulation = previousAccumulation + debtAdded - debtPaid;
```

`debtAdded` semantics (from the new-record form):

- **Quantity empty** (service/job): `debtAdded = itemPrice`
- **Quantity filled**: `debtAdded = itemQuantity × itemPrice`
- **Pay row**: `itemName = "Pembayaran"`, `debtAdded = 0`, `debtPaid = <amount>`

The dev seeder uses a raw-SQL `SUM() OVER (ORDER BY date, id)` window to rebuild the whole ledger
(`recalculateProfileAccumulation` in `app/dev/actions.ts`) — a useful utility if a migration or
manual edit ever desyncs stored accumulations.

---

## 8. Running Locally

```bash
# 1. Install (pnpm is required — this repo uses a pnpm workspace/lockfile)
pnpm install

# 2. Set up the database
#    - Have a local PostgreSQL running (dev URL: postgresql://postgres:****@localhost:5432/aldendigitalprinting)
#    - Provide DATABASE_URL in a local .env (or shell env)

# 3. Generate the Prisma client (required before any DB access / build)
npx prisma generate

# 4. Apply migrations
npx prisma migrate dev        # dev; npx prisma migrate deploy  in production

# 5. Run
pnpm dev                      # http://localhost:3000
```

Other scripts: `pnpm build` (`next build`), `pnpm start` (`next start`), `pnpm lint` (`eslint`).
There is **no test script** and no test runner configured.

---

## 9. Build & Production Run

```bash
pnpm build    # next build  — REQUIRES: network (Google Fonts) + a reachable DATABASE_URL at build time?
pnpm start    # next start  — runs the production server, reads DATABASE_URL at runtime
```

> ⚠️ The pages are dynamic (server components that query Prisma), so `next build` will execute
> Prisma queries during prerendering. `DATABASE_URL` must point at a reachable, migrated Postgres
> **at build time** for the build to succeed. Because `prisma generate` must run first and the
> client output is gitignored, the deployment build must run `prisma generate` (or
> `prisma migrate deploy && prisma generate`) **before** `next build`.

---

## 10. Deployment Considerations (read this before asking follow-ups)

1. **Nothing is deployed yet.** No `vercel.json`, Dockerfile, Procfile, `fly.toml`, or CI config
   exists in the repo. The git remote is GitHub only.
2. **Hosted Postgres is required.** The app is stateless except for the database. A managed
   Postgres (Neon, Supabase, Railway, Render, RDS, Cloud SQL, ...) + a `DATABASE_URL` env var is
   all that's needed. A commented-out **Neon** URL exists in `.env`, hinting at a preferred host.
3. **Deploy build sequence matters.** Because the Prisma client lives in `node_modules` (gitignored
   output) and `accumulation` logic lives in DB migrations, the deploy pipeline should be:
   `pnpm install` → `npx prisma migrate deploy` → `npx prisma generate` → `pnpm build` →
   start (`next start` for a Node server; or platform-native build for Vercel).
4. **Serverless is viable.** Prisma 7 + `@prisma/adapter-pg` + `pg` Pool runs on Vercel; be aware of
   connection pooling (use `?pgbouncer=true` / connection-pooler URL or external pooler for
   serverless). The `globalForPrisma` singleton guard is a dev-only optimization and is skipped in
   production.
5. **Build-time env vars.** `DATABASE_URL` is read during prerendering of dynamic pages — the
   platform's build must expose it. Fonts are fetched from Google at build time (Neon/Geist/Inter).
6. **pnpm quirks:** `pnpm-workspace.yaml` sets `ignoredBuiltDependencies: [sharp, unrs-resolver]`,
   meaning pnpm won't run their postinstall builds. The app does **not** use `next/image`, so sharp
   (Next's optional image optimizer) is probably not needed; if you later add image optimization,
   run `pnpm approve-builds` (pnpm 10+) so sharp compiles.
7. **Dev-only route**: `/dev` and `app/dev/*` are inert in production (`notFound()` guard) but are
   committed — safe to keep, or strip if you prefer a lean production bundle.
8. **Security posture:** No auth, no rate limiting, no CSRF concern beyond default Server Action
   protections. This is an internal single-user tool. Any public exposure should be behind a VPN,
   basic auth, or SSO. `Profile`/`Transaction` IDs are UUIDs but unguessability is not a security
   boundary.
9. **Region/locale:** Currency is IDR (Indonesian Rupiah), dates formatted `id-ID` (DD/MM). Time
   zones: `date` values are stored with local wall-clock time via Server Actions; the app does not
   do explicit timezone conversion — worth confirming on a hosted DB's server timezone.
10. **No observability/backups configured.** Add DB backups, logs, and (optionally) Sentry before
    real data goes in. The `accumulation` column is a manual running total — a raw-SQL recalc
    exists in dev tooling if totals ever drift.

---

## 11. Quick Facts Checklist (for a deployment Q&A)

- App type: **Next.js 16 App Router SSR app** (dynamic pages), Node server or serverless host.
- DB: **PostgreSQL** via **Prisma 7** driver adapter (`@prisma/adapter-pg`), single `DATABASE_URL`.
- All backend logic = **Server Actions**; no REST/gRPC/API routes.
- Money = integer IDR; running balances stored per-row (`accumulation`).
- No auth, no file uploads, no images, no queues, no background jobs, no external APIs at runtime.
- Env var count: exactly **1** (`DATABASE_URL`).
- Package manager: **pnpm** (lockfile committed). Node ≥ 20.9.
- Production start command: `next start` (or platform build command).
- Build prerequisites: reachable migrated DB + network for Google Fonts + `prisma generate`.
