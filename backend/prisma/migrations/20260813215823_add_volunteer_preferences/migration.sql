-- AlterTable
ALTER TABLE "volunteer_profiles" ADD COLUMN     "availability" JSONB,
ADD COLUMN     "service_area" VARCHAR(255);

-- CreateTable
CREATE TABLE "support_categories" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "support_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_support_categories" (
    "id" SERIAL NOT NULL,
    "volunteer_id" INTEGER NOT NULL,
    "support_category_id" INTEGER NOT NULL,

    CONSTRAINT "user_support_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "support_categories_name_key" ON "support_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_support_categories_volunteer_id_support_category_id_key" ON "user_support_categories"("volunteer_id", "support_category_id");

-- CreateIndex
CREATE INDEX "volunteer_profiles_service_area_idx" ON "volunteer_profiles"("service_area");

-- AddForeignKey
ALTER TABLE "user_support_categories" ADD CONSTRAINT "user_support_categories_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteer_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_support_categories" ADD CONSTRAINT "user_support_categories_support_category_id_fkey" FOREIGN KEY ("support_category_id") REFERENCES "support_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
