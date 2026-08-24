-- AddForeignKey
ALTER TABLE "HelpRequest" ADD CONSTRAINT "HelpRequest_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "volunteer_profiles"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
