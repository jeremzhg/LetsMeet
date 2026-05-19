/*
  Warnings:

  - Added the required column `reasoning` to the `GeneralMatchScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeneralMatchScore" ADD COLUMN     "reasoning" TEXT NOT NULL;
