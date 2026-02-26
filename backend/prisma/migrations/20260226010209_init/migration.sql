-- CreateTable
CREATE TABLE "Events" (
    "id" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "organizationID" TEXT NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partners" (
    "eventID" TEXT NOT NULL,
    "corporationID" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Partners_pkey" PRIMARY KEY ("eventID","corporationID")
);

-- CreateTable
CREATE TABLE "MatchScore" (
    "eventID" TEXT NOT NULL,
    "corporationID" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT,

    CONSTRAINT "MatchScore_pkey" PRIMARY KEY ("eventID","corporationID")
);

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partners" ADD CONSTRAINT "Partners_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partners" ADD CONSTRAINT "Partners_corporationID_fkey" FOREIGN KEY ("corporationID") REFERENCES "Corporation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_eventID_fkey" FOREIGN KEY ("eventID") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScore" ADD CONSTRAINT "MatchScore_corporationID_fkey" FOREIGN KEY ("corporationID") REFERENCES "Corporation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
