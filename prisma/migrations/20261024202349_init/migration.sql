-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "name" TEXT,
    "handle" TEXT,
    "image" TEXT,
    "avatar" TEXT NOT NULL DEFAULT 'tri-amber',
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "plan" TEXT NOT NULL DEFAULT 'member',
    "uiMode" TEXT NOT NULL DEFAULT 'all',
    "theme" TEXT NOT NULL DEFAULT 'night',
    "totpEnabled" BOOLEAN NOT NULL DEFAULT false,
    "totpSecret" TEXT,
    "rampStepsJson" TEXT NOT NULL DEFAULT '[]',
    "badgesJson" TEXT NOT NULL DEFAULT '["founding"]',
    "tapeJson" TEXT NOT NULL DEFAULT '["SPY","QQQ","NVDA","AAPL","MSFT","MU","GLD","WTI"]',
    "defaultsJson" TEXT NOT NULL DEFAULT '{"bench":"$SPXTR","startYear":1998,"splitYear":2015,"costBps":10}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "passwordChangedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resetTokenHash" TEXT,
    "resetExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PasswordCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AccountInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "activeForEmail" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "tokenHash" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "invitedById" TEXT,
    "acceptedById" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AccountInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AccountInvitation_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "actorUserId" TEXT,
    "targetEmail" TEXT,
    "invitationId" TEXT,
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "AccountInvitation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "McpApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "categoriesJson" TEXT NOT NULL DEFAULT '["core"]',
    "callsToday" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "McpApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedStudy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "strategyId" TEXT,
    "engine" TEXT NOT NULL DEFAULT 'factor',
    "criteriaJson" TEXT NOT NULL,
    "benchmark" TEXT NOT NULL DEFAULT '$SPXTR',
    "startYear" INTEGER NOT NULL DEFAULT 1998,
    "splitYear" INTEGER NOT NULL DEFAULT 2015,
    "finding" TEXT NOT NULL DEFAULT 'DATA VALIDATED',
    "cagr" REAL NOT NULL,
    "benchCagr" REAL NOT NULL,
    "sharpe" REAL NOT NULL,
    "benchSharpe" REAL NOT NULL,
    "maxDrawdown" REAL NOT NULL,
    "oosStatus" TEXT NOT NULL DEFAULT 'HOLDING UP',
    "sinceSavedReturn" REAL NOT NULL DEFAULT 3.4,
    "benchSinceSaved" REAL NOT NULL DEFAULT 1.8,
    "paperBookEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paperEquity" REAL NOT NULL DEFAULT 100000,
    "alertEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SavedStudy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPortfolio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Core Quant Book',
    "holdingsJson" TEXT NOT NULL,
    "linkedStudyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPortfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CloudBot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "versionHash" TEXT NOT NULL,
    "cronSchedule" TEXT NOT NULL DEFAULT '35 9 * * 1-5',
    "mode" TEXT NOT NULL DEFAULT 'paper',
    "status" TEXT NOT NULL DEFAULT 'paused',
    "alpacaKeyMasked" TEXT,
    "attestedVersion" TEXT,
    "paperWindowChoice" TEXT NOT NULL DEFAULT 'use_30d_paper',
    "runsJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CloudBot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UniversityProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "lessonPlayed" BOOLEAN NOT NULL DEFAULT false,
    "actionDone" BOOLEAN NOT NULL DEFAULT false,
    "quizPassed" BOOLEAN NOT NULL DEFAULT false,
    "quizScore" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UniversityProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "authorHandle" TEXT NOT NULL,
    "authorRole" TEXT NOT NULL DEFAULT 'MEMBER',
    "category" TEXT NOT NULL DEFAULT 'studies',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "studyPayloadJson" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForumReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT,
    "authorHandle" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ForumReply_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL DEFAULT 'Alpha Desk Research',
    "ownerId" TEXT,
    "seatsJson" TEXT NOT NULL DEFAULT '[]',
    "filesJson" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TeamCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boardId" TEXT NOT NULL,
    "column" TEXT NOT NULL DEFAULT 'NOTES',
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "finding" TEXT,
    "cagr" REAL,
    "sharpe" REAL,
    "maxDrawdown" REAL,
    "author" TEXT NOT NULL DEFAULT 'Operator',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamCard_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "TeamBoard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EventRule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "eventKind" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'pause_entries',
    "windowDays" INTEGER NOT NULL DEFAULT 5,
    "scope" TEXT NOT NULL DEFAULT 'all_signals',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventRule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CrisisPlay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "crisisId" TEXT NOT NULL,
    "totalReturn" REAL NOT NULL,
    "benchReturn" REAL NOT NULL,
    "maxDrawdown" REAL NOT NULL,
    "decisions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CrisisPlay_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_handle_key" ON "User"("handle");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordCredential_userId_key" ON "PasswordCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordCredential_resetTokenHash_key" ON "PasswordCredential"("resetTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "AccountInvitation_activeForEmail_key" ON "AccountInvitation"("activeForEmail");

-- CreateIndex
CREATE UNIQUE INDEX "AccountInvitation_tokenHash_key" ON "AccountInvitation"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "AccountInvitation_acceptedById_key" ON "AccountInvitation"("acceptedById");

-- CreateIndex
CREATE INDEX "AccountInvitation_normalizedEmail_status_idx" ON "AccountInvitation"("normalizedEmail", "status");

-- CreateIndex
CREATE INDEX "AccountInvitation_status_expiresAt_idx" ON "AccountInvitation"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "McpApiKey_keyHash_key" ON "McpApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "McpApiKey_userId_idx" ON "McpApiKey"("userId");

-- CreateIndex
CREATE INDEX "SavedStudy_userId_idx" ON "SavedStudy"("userId");

-- CreateIndex
CREATE INDEX "UserPortfolio_userId_idx" ON "UserPortfolio"("userId");

-- CreateIndex
CREATE INDEX "CloudBot_userId_idx" ON "CloudBot"("userId");

-- CreateIndex
CREATE INDEX "UniversityProgress_userId_idx" ON "UniversityProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UniversityProgress_userId_chapterId_key" ON "UniversityProgress"("userId", "chapterId");

-- CreateIndex
CREATE INDEX "ForumPost_category_createdAt_idx" ON "ForumPost"("category", "createdAt");

-- CreateIndex
CREATE INDEX "ForumReply_postId_idx" ON "ForumReply"("postId");

-- CreateIndex
CREATE INDEX "TeamCard_boardId_column_idx" ON "TeamCard"("boardId", "column");

-- CreateIndex
CREATE INDEX "EventRule_userId_idx" ON "EventRule"("userId");
