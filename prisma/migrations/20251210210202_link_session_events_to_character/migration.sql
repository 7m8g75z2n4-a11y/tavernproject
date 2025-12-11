-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SessionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "characterId" TEXT,
    "npcId" TEXT,
    "questId" TEXT,
    "downtimeActivityId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionEvent_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionEvent_npcId_fkey" FOREIGN KEY ("npcId") REFERENCES "NPC" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionEvent_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SessionEvent_downtimeActivityId_fkey" FOREIGN KEY ("downtimeActivityId") REFERENCES "DowntimeActivity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SessionEvent" ("characterId", "createdAt", "id", "message", "sessionId", "type") SELECT "characterId", "createdAt", "id", "message", "sessionId", "type" FROM "SessionEvent";
DROP TABLE "SessionEvent";
ALTER TABLE "new_SessionEvent" RENAME TO "SessionEvent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
