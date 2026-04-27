-- CreateTable
CREATE TABLE "GeneralMatchScore" (
    "corporationID" TEXT NOT NULL,
    "organizationID" TEXT NOT NULL,
    "matchScore" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "GeneralMatchScore_pkey" PRIMARY KEY ("corporationID","organizationID")
);

-- AddForeignKey
ALTER TABLE "GeneralMatchScore" ADD CONSTRAINT "GeneralMatchScore_corporationID_fkey" FOREIGN KEY ("corporationID") REFERENCES "Corporation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GeneralMatchScore" ADD CONSTRAINT "GeneralMatchScore_organizationID_fkey" FOREIGN KEY ("organizationID") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
