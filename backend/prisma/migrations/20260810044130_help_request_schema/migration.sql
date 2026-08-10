-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GROCERY', 'TRANSPORTATION', 'HOUSEHOLD_CHORES', 'YARD_WORK', 'PET_CARE', 'TECH_SUPPORT', 'COMPANIONSHIP', 'MEAL_PREP', 'MEDICAL_ERRAND', 'OTHER');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "HelpRequest" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "volunteerId" INTEGER,
    "title" VARCHAR(100) NOT NULL,
    "category" "Category" NOT NULL,
    "urgency" "Urgency" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "placeId" TEXT,
    "description" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "HelpRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
