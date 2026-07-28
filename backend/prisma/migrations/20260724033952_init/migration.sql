-- CreateEnum
CREATE TYPE "Role" AS ENUM ('REQUESTER', 'VOLUNTEER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(30) NOT NULL,
    "hashed_password" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'REQUESTER',
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dob" TIMESTAMP(3),
    "gender" "Gender" NOT NULL,
    "profile_image" BYTEA,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
