ALTER TABLE "HelpRequest"
  ADD COLUMN "scheduledDayOfWeek" INTEGER
  GENERATED ALWAYS AS (EXTRACT(DOW FROM "scheduledAt")) STORED NOT NULL;

CREATE INDEX "HelpRequest_scheduledDayOfWeek_idx" ON "HelpRequest" ("scheduledDayOfWeek");