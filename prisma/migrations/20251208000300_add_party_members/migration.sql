-- CreateTable
CREATE TABLE "PartyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerEmail" TEXT,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
-- Add Foreign Keys
PRAGMA foreign_keys=OFF;
CREATE TEMPORARY TABLE "_PartyMember_backfill" AS SELECT * FROM "PartyMember";
DROP TABLE "PartyMember";
CREATE TABLE "PartyMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerEmail" TEXT,
    "campaignId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PartyMember_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PartyMember_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "PartyMember" ("id","ownerEmail","campaignId","characterId","createdAt","updatedAt") SELECT "id","ownerEmail","campaignId","characterId","createdAt","updatedAt" FROM "_PartyMember_backfill";
DROP TABLE "_PartyMember_backfill";
PRAGMA foreign_keys=ON;
