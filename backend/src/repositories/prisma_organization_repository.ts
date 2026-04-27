import { Prisma, Organization } from "../generated/prisma/client";
import { prisma } from "../configs/db";

async function findOrgByEmail(email: string): Promise<Organization | null>{
  return await prisma.organization.findUnique({
    where: {email},
  });
};

async function createOrg(data: Prisma.OrganizationCreateInput): Promise<Organization>{
  return await prisma.organization.create({
    data,
  });
};

async function findOrgById (id: string): Promise<Organization | null>{
  return await prisma.organization.findUnique({
    where: {id},
  });
};

async function getAllOrgsWithPastEvents() {
  return await prisma.organization.findMany({
    include: {
      events: {
        where: {
          status: "completed",
        },
        select: {
          id: true,
          title: true,
          details: true,
          city: true,
          country: true,
          venue: true,
        },
      },
    },
  });
}

async function getOrgWithPastEventsById(id: string) {
  return await prisma.organization.findUnique({
    where: { id },
    include: {
      events: {
        where: {
          status: "completed",
        },
        select: {
          id: true,
          title: true,
          details: true,
          city: true,
          country: true,
          venue: true,
        },
      },
    },
  });
}

export {
  findOrgByEmail,
  findOrgById,
  createOrg,
  getAllOrgsWithPastEvents,
  getOrgWithPastEventsById,
}