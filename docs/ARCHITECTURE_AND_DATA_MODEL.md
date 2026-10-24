# System Architecture & Data Model — QuantGPT

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Browser / Client Layer                              │
│  ┌──────────────────────────────┐    ┌──────────────────────────────────┐  │
│  │ Public & Educational Surface │    │ Authenticated Research Terminal  │  │
│  │ /, /library, /learn/*,       │    │ /terminal, /grade, /halal,       │  │
│  │ /mcp, /data-warehouse,       │    │ /technicals, /model, /journal,   │  │
│  │ /execution, /events/oil-..., │    │ /monitor, /pm, /events, /sim,    │  │
│  │ /compare/*, /study/[slug],   │    │ /futuretest, /portfolio, /runner,│  │
│  │ /verify, /status, /world/*   │    │ /chat, /connect, /university,    │  │
│  └──────────────┬───────────────┘    │ /forum, /board, /team, /account, │  │
│                 │                    │ /admin (Invite Console)          │  │
│                 │                    └─────────────────┬────────────────┘  │
└─────────────────┼──────────────────────────────────────┼───────────────────┘
                  │ HTTPS / JSON / Next.js App Router    │
┌─────────────────▼──────────────────────────────────────▼───────────────────┐
│                     Next.js 16 + NextAuth + API Layer                      │
│  ┌─────────────────────────┐  ┌────────────────────────┐  ┌──────────────┐ │
│  │ Auth & Invite Admission │  │ Quant Compute Engines  │  │ MCP Server   │ │
│  │ - NextAuth JWT/Session  │  │ - Backtester & Sweep   │  │ /api/mcp     │ │
│  │ - AccountInvitation     │  │ - 11-Check Skeptic     │  │ JSON-RPC 2.0 │ │
│  │ - AuditLog              │  │ - 6D Grader & Halal    │  │ 19 Core + 7  │ │
│  │ - RBAC (ADMIN/PRO/MEM)  │  │ - 44-Factor Technicals │  │ Categories   │ │
│  │ - TOTP / Passkeys / Key │  │ - 10Y DCF & Solver     │  └──────────────┘ │
│  └────────────┬────────────┘  └───────────┬────────────┘                   │
└───────────────┼───────────────────────────┼────────────────────────────────┘
                │ Prisma 7 Adapter          │ Point-in-Time Warehouse
┌───────────────▼───────────────────────────▼────────────────────────────────┐
│   Relational Store (SQLite in Dev / PostgreSQL in Prod) + Seeded Warehouse │
│  - Users, AccountInvitations, AuditLogs, McpApiKeys, UserPreferences       │
│  - SavedStudies (Journal), PaperBooks, StrategyAlerts, Portfolios          │
│  - CloudBots (Runner), CrisisPlays, UniversityProgress, ForumPosts, Teams  │
│  - 175 Strategies, 39 Studies, 19 Event Kinds, S&P/NDX/Stock Bar Warehouse │
└────────────────────────────────────────────────────────────────────────────┘
```

## 2. Database Schema (Dual SQLite & PostgreSQL via Prisma 7)

### 2.1 Core Authentication, Invite Admission & Audit Models
- **`User`**:
  - `id` (String, CUID PK)
  - `email` (String, Unique, lowercase normalized)
  - `name` (String?)
  - `handle` (String?, Unique — e.g. `operator_42`)
  - `avatar` (String, default `"tri-amber"`)
  - `passwordHash` (String)
  - `role` (String: `"ADMIN" | "PRO" | "MEMBER"`, default `"MEMBER"`)
  - `plan` (String: `"pro" | "member"`, default `"member"`)
  - `uiMode` (String: `"simple" | "all"`, default `"all"`)
  - `theme` (String: `"night" | "day" | "system"`, default `"night"`)
  - `totpEnabled` (Boolean, default `false`)
  - `totpSecret` (String?)
  - `rampStepsJson` (String, default `"[]"`)
  - `badgesJson` (String, default `"[\"founding\"]"`)
  - `tapeJson` (String, default `"[\"SPY\",\"QQQ\",\"NVDA\",\"AAPL\",\"MSFT\",\"MU\",\"GLD\",\"WTI\"]"`)
  - `defaultsJson` (String, default `"{\"bench\":\"$SPXTR\",\"startYear\":1998,\"splitYear\":2015,\"costBps\":10}"`)
  - `createdAt`, `updatedAt`
- **`AccountInvitation`**:
  - `id` (String, CUID PK)
  - `email` (String, indexed)
  - `role` (String, default `"MEMBER"`)
  - `tokenHash` (String, Unique, SHA-256 hex digest)
  - `expiresAt` (DateTime)
  - `acceptedAt` (DateTime?)
  - `revokedAt` (DateTime?)
  - `invitedByUserId` (String, FK -> `User.id`)
  - `acceptedByUserId` (String?, Unique, FK -> `User.id`)
  - `createdAt`, `updatedAt`
- **`AuditLog`**:
  - `id` (String, CUID PK)
  - `action` (String, indexed — e.g. `INVITATION_CREATED`, `INVITATION_REVOKED`, `INVITATION_ACCEPTED`, `USER_ROLE_UPDATED`, `ADMIN_BOOTSTRAPPED`, `MCP_KEY_ISSUED`, `MCP_KEY_REVOKED`, `PASSWORD_CHANGED`, `BOT_ATTESTED`)
  - `actorUserId` (String?, FK -> `User.id`, indexed)
  - `targetEmail` (String?)
  - `invitationId` (String?, FK -> `AccountInvitation.id`, indexed)
  - `metadataJson` (String?)
  - `createdAt` (DateTime, indexed)
- **`McpApiKey`**:
  - `id` (String, CUID PK)
  - `userId` (String, FK -> `User.id`)
  - `label` (String)
  - `keyPrefix` (String — e.g. `qg_sk_8f92...`)
  - `keyHash` (String, Unique, SHA-256)
  - `categoriesJson` (String, default `"[\"core\"]"`)
  - `callsToday` (Int, default `0`)
  - `lastUsedAt` (DateTime?)
  - `revokedAt` (DateTime?)
  - `createdAt` (DateTime)

### 2.2 Research, Tracking, Cloud & Community Models
- **`SavedStudy` (Findings Journal & Paper Books & Watches)**:
  - `id` (String, CUID PK)
  - `userId` (String, FK -> `User.id`)
  - `name` (String)
  - `strategyId` (String?)
  - `criteriaJson` (String)
  - `benchmark` (String)
  - `startYear` (Int)
  - `splitYear` (Int)
  - `finding` (String: `"DATA VALIDATED" | "TRADE-OFF" | "NO EDGE"`)
  - `cagr` (Float)
  - `benchCagr` (Float)
  - `sharpe` (Float)
  - `benchSharpe` (Float)
  - `maxDrawdown` (Float)
  - `oosStatus` (String: `"HOLDING UP" | "MIXED" | "FADING" | "TOO EARLY"`)
  - `sinceSavedReturn` (Float)
  - `benchSinceSaved` (Float)
  - `paperBookEnabled` (Boolean, default `false`)
  - `paperEquity` (Float, default `100000`)
  - `alertEnabled` (Boolean, default `false`)
  - `createdAt`, `updatedAt`
- **`UserPortfolio`**:
  - `id` (String, CUID PK)
  - `userId` (String, FK -> `User.id`)
  - `name` (String)
  - `holdingsJson` (String — array of `{ ticker, weight, shares }`)
  - `linkedStudyId` (String?)
  - `createdAt`, `updatedAt`
- **`CloudBot` (QuantGPT Cloud Runner)**:
  - `id` (String, CUID PK)
  - `userId` (String, FK -> `User.id`)
  - `name` (String)
  - `code` (String)
  - `versionHash` (String)
  - `cronSchedule` (String — e.g. `"35 9 * * 1-5"`)
  - `mode` (String — `"paper" | "live"`)
  - `status` (String — `"paused" | "running" | "stopped"`)
  - `alpacaKeyMasked` (String?)
  - `attestedVersion` (String?)
  - `paperWindowChoice` (String — `"use_30d_paper" | "skip_paper"`)
  - `runsJson` (String — execution log entries)
  - `createdAt`, `updatedAt`
- **`UniversityProgress`**:
  - `id` (String, CUID PK)
  - `userId` (String, FK -> `User.id`)
  - `chapterId` (String — `"S1".."S5" | "G1".."G5" | "L1".."L7"`)
  - `lessonPlayed` (Boolean, default `false`)
  - `actionDone` (Boolean, default `false`)
  - `quizPassed` (Boolean, default `false`)
  - `quizScore` (Int, default `0`)
  - `updatedAt` (DateTime)
- **`ForumPost` & `ForumReply`**:
  - `id`, `userId`, `authorHandle`, `authorRole`, `category` (`announcements`, `studies`, `findings`, `introductions`, `strategy`, `pro`, `help`, `bugs`, `offtopic`), `title`, `body`, `studyPayloadJson`, `upvotes`, `createdAt`, and replies.
- **`TeamBoard` & `TeamCard`**:
  - `id`, `name`, `ownerId`, `seatsJson`, `filesJson`, and cards across `NOTES`, `RUNNING`, and `DATA VALIDATED` columns.
