import { prisma } from "../configs/db";
import { Prisma, Partners } from "../generated/prisma/client";

async function createPartner(data: Prisma.PartnersCreateInput): Promise<Partners>{
  return await prisma.partners.create({
    data,
  });
};

async function updatePartner(eventID: string, corporationID: string, data: Prisma.PartnersUpdateInput): Promise<Partners>{
  return await prisma.partners.update({
    where: {eventID_corporationID: {eventID, corporationID}},
    data,
  });
};

export {createPartner, updatePartner};