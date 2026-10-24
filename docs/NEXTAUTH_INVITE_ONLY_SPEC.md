# NextAuth Invite-Only Registration & Account Admission Specification

## 1. Security & Operational Invariants
1. **No Demo Users:** Zero demo user accounts may exist in Prisma seeds, migrations, or sign-in pages.
2. **Invite-Only Registration:** New users cannot self-register without a valid, unrevoked, unexpired, single-use `AccountInvitation` token whose invited email matches their registration email (case-insensitive).
3. **Bootstrap Admin via CLI Only:** The initial `ADMIN` account is provisioned exclusively via `npm run bootstrap:admin` (`scripts/bootstrap-admin.ts`), which reads `--email`, `--password`, `--name` flags or `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_NAME` environment variables, hashes the password with `bcryptjs` (cost 12), upserts the `ADMIN` user, and writes an `ADMIN_BOOTSTRAPPED` record to `AuditLog`.
4. **Hashed Tokens at Rest:** Raw invitation tokens (`32` random bytes encoded as `base64url`) are never stored in the database; only their SHA-256 hex digest (`tokenHash`) is persisted in `AccountInvitation`.

## 2. Invitation Lifecycle & Validation (`src/lib/account-admission/invitations.ts`)
- **Creation (`POST /api/admin/invitations`):**
  - Requires authenticated session with `user.role === "ADMIN"`.
  - Normalizes `email = email.trim().toLowerCase()`.
  - Revokes any prior pending invitations for the same email before creating a fresh invitation.
  - Generates raw token + `tokenHash`, sets `expiresAt` (default 7 days, configurable 1–30 days), and logs `INVITATION_CREATED` to `AuditLog`.
  - Returns the one-time invite URL `/join?invite=<rawToken>` (also accessible at `/accept?token=<rawToken>`).
- **Inspection (`GET /api/invitations/[token]`):**
  - Computes `hashInvitationToken(token)` and returns the invitation status (`VALID`, `INVALID`, `REVOKED`, `ACCEPTED`, `EXPIRED`) along with the masked/target email and assigned role (`MEMBER`, `PRO`, `ADMIN`).
- **Consumption (`POST /api/auth/register`):**
  - Runs inside `prisma.$transaction`:
    1. Looks up `AccountInvitation` by `tokenHash`.
    2. Verifies status is `VALID` and `invitation.email === normalizedEmail`.
    3. Verifies no `User` already exists with `normalizedEmail`.
    4. Hashes password (`bcryptjs`, 12 rounds) and creates `User` with `role: invitation.role` and `plan: invitation.role === "PRO" || invitation.role === "ADMIN" ? "pro" : "member"`.
    5. Marks `AccountInvitation.acceptedAt = new Date()` and `acceptedByUserId = user.id`.
    6. Inserts `AuditLog` with `action: "INVITATION_ACCEPTED"`.
- **Revocation (`POST /api/admin/invitations/[id]/revoke`):**
  - Requires `ADMIN` role.
  - Sets `revokedAt = new Date()` on pending invitation and records `INVITATION_REVOKED` in `AuditLog`.

## 3. Role-Based Authorization (`ADMIN`, `PRO`, `MEMBER`)
- `MEMBER`: Full access to Terminal Backtester, Strategy Library, Stock Grader, Halal Screen, Technicals, Findings Journal, Monitor, World Events, Portfolio Checkup, University, Forum, and MCP Server (up to 3 keys, 500 calls/day).
- `PRO`: Everything in `MEMBER` plus QuantGPT Cloud Bot Runner (`/runner`, up to 5 bots), DCF Excel Formula Export (`/model`), Pro Forum rooms, and 5 MCP keys (1,500 calls/day).
- `ADMIN`: Everything in `PRO` plus Admin Console (`/admin`) for issuing/revoking `AccountInvitation` codes, managing user roles (`USER_ROLE_UPDATED`), and inspecting `AuditLog`.
