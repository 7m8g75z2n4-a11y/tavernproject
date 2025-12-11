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
    "coreJson" JSONB,
    "appearanceJson" JSONB,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" DATETIME,
    "hp" TEXT,
    "ac" INTEGER,
    "speed" TEXT,
    "notes" TEXT,
    "ownerEmail" TEXT,
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Character" ("ac", "avatarUrl", "class", "createdAt", "createdById", "hp", "id", "level", "name", "notes", "ownerEmail", "speed", "subtitle", "updatedAt") SELECT "ac", "avatarUrl", "class", "createdAt", "createdById", "hp", "id", "level", "name", "notes", "ownerEmail", "speed", "subtitle", "updatedAt" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
