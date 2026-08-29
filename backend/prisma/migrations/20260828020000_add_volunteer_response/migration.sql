-- CreateEnum
CREATE TYPE "VolunteerResponseAction" AS ENUM ('ACCEPTED', 'DECLINED');

-- CreateTable
CREATE TABLE "volunteer_responses" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "volunteer_id" INTEGER NOT NULL,
    "action" "VolunteerResponseAction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "volunteer_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "volunteer_responses_request_id_idx" ON "volunteer_responses"("request_id");

-- CreateIndex
CREATE INDEX "volunteer_responses_volunteer_id_idx" ON "volunteer_responses"("volunteer_id");

-- CreateIndex
CREATE UNIQUE INDEX "volunteer_responses_request_id_volunteer_id_key" ON "volunteer_responses"("request_id", "volunteer_id");

-- AddForeignKey
ALTER TABLE "volunteer_responses" ADD CONSTRAINT "volunteer_responses_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "HelpRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_responses" ADD CONSTRAINT "volunteer_responses_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
