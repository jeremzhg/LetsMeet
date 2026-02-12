import { PrismaClient, Prisma, Organization } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connStr = process.env.DATABASE_URL;
const pool = new pg.Pool({connectionString: connStr});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

export const findOrgByEmail = async (email: string): Promise<Organization | null> => {
  return await prisma.organization.findUnique({
    where: {email},
  });
};

export const createOrg = async (data: Prisma.OrganizationCreateInput): Promise<Organization> => {
  return await prisma.organization.create({
    data,
  });
};

export const findOrgById = async (id: string): Promise<Organization | null> => {
  return await prisma.organization.findUnique({
    where: {id},
  });
};