/*
  Warnings:

  - You are about to drop the `PastEvents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PastEvents" DROP CONSTRAINT "PastEvents_corporationID_fkey";

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "corporationID" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- DropTable
DROP TABLE "PastEvents";

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_corporationID_fkey" FOREIGN KEY ("corporationID") REFERENCES "Corporation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
