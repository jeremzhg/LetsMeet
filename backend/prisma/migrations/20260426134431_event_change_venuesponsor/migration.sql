/*
  Warnings:

  - Added the required column `targetSponsorValue` to the `Events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venue` to the `Events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "targetSponsorValue" INTEGER NOT NULL,
ADD COLUMN     "venue" TEXT NOT NULL;
