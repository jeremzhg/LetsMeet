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

export {findOrgByEmail, findOrgById, createOrg}