ALTER TABLE "Project"
ADD COLUMN "period" TEXT NOT NULL DEFAULT 'Период не указан',
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
