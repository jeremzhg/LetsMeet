/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Corporation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "details" TEXT NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Corporation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PastEvents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "corporationID" TEXT NOT NULL,

    CONSTRAINT "PastEvents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Corporation_email_key" ON "Corporation"("email");

-- AddForeignKey
ALTER TABLE "PastEvents" ADD CONSTRAINT "PastEvents_corporationID_fkey" FOREIGN KEY ("corporationID") REFERENCES "Corporation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
