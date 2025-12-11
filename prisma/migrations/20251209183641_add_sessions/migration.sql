-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN "description" TEXT;
ALTER TABLE "Campaign" ADD COLUMN "system" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "class" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "avatarUrl" TEXT,
    "hp" TEXT,
    "ac" INTEGER,
    "speed" TEXT,
    "notes" TEXT,
    "ownerEmail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Character" ("ac", "createdAt", "hp", "id", "name", "notes", "ownerEmail", "speed", "subtitle", "updatedAt") SELECT "ac", "createdAt", "hp", "id", "name", "notes", "ownerEmail", "speed", "subtitle", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionDate" DATETIME,
    "summary" TEXT,
    "notes" TEXT,
    "ownerEmail" TEXT,
    "campaignId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("campaignId", "createdAt", "id", "notes", "ownerEmail", "sessionDate", "title", "updatedAt") SELECT "campaignId", "createdAt", "id", "notes", "ownerEmail", "sessionDate", "title", "updatedAt" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
