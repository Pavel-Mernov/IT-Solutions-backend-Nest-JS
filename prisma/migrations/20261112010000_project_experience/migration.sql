-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Experience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "projectName" TEXT,
    "period" TEXT NOT NULL DEFAULT 'Период не указан',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "achievements" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "profileId" TEXT NOT NULL,
    CONSTRAINT "Experience_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Experience" ("achievements", "company", "endDate", "id", "order", "position", "profileId", "startDate") SELECT "achievements", "company", "endDate", "id", "order", "position", "profileId", "startDate" FROM "Experience";
DROP TABLE "Experience";
ALTER TABLE "new_Experience" RENAME TO "Experience";
CREATE INDEX "Experience_profileId_order_idx" ON "Experience"("profileId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

