/*
  Warnings:

  - Added the required column `category` to the `Corporation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedParticipants` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Corporation" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "expectedParticipants" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Partners" ADD COLUMN     "packageID" TEXT;

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "eventID" TEXT NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Partners" ADD CONSTRAINT "Partners_packageID_fkey" FOREIGN KEY ("packageID") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
