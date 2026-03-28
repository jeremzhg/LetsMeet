import { prisma } from "../configs/db";
import { Prisma, Partners } from "../generated/prisma/client";

async function createPartner(data: Prisma.PartnersUncheckedCreateInput): Promise<Partners>{
  return await prisma.partners.create({
    data,
  });
};

async function updatePartner(eventID: string, corporationID: string, data: Prisma.PartnersUncheckedUpdateInput): Promise<Partners>{
  return await prisma.partners.update({
    where: {eventID_corporationID: {eventID, corporationID}},
    data,
  });
};

async function getPartnerById(eventID: string, corporationID: string): Promise<Partners | null>{
  return await prisma.partners.findUnique({
    where: {eventID_corporationID: {eventID, corporationID}},
  });
};

async function getPartnersByEventId(eventID: string): Promise<Partners[]>{
  return await prisma.partners.findMany({
    where: {eventID},
  });
};

async function getPartnersByCorporationId(corporationID: string) {
  return await prisma.partners.findMany({
    where: {corporationID},
    include: {
      event: true,
      corporation: {
        select: {
          id: true,
          name: true,
          email: true,
          details: true,
          category: true,
          isClaimed: true,
        },
      },
    },
  });
};

async function getPartnersByOrganizationId(organizationID: string) {
  return await prisma.partners.findMany({
    where: { event: { organizationID } },
    include: {
      event: true,
      corporation: {
        select: {
          id: true,
          name: true,
          email: true,
          details: true,
          category: true,
          isClaimed: true,
        },
      },
    },
  });
};

export {createPartner, updatePartner, getPartnerById, getPartnersByEventId, getPartnersByCorporationId, getPartnersByOrganizationId};