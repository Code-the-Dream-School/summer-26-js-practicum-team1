-- CreateTable
CREATE TABLE "requester_profiles" (
    "userId" INTEGER NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "bio" TEXT,
    "emergencyContact" TEXT,

    CONSTRAINT "requester_profiles_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "requester_profiles" ADD CONSTRAINT "requester_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
