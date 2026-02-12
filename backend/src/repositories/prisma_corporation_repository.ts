import { PrismaClient, Prisma, Corporation } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connStr = process.env.DATABASE_URL;
const pool = new pg.Pool({connectionString: connStr});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

async function findCorpByEmail(email: string): Promise<Corporation | null>{
  return await prisma.corporation.findUnique({
    where: {email},
  });
};

async function createCorp(data: Prisma.CorporationCreateInput): Promise<Corporation>{
  return await prisma.corporation.create({
    data,
  });
};

async function findCorpById (id: string): Promise<Corporation | null>{
  return await prisma.corporation.findUnique({
    where: {id},
  });
};

async function claimCorp(
  id: string, 
  data: { 
    hashedPassword: string; 
    name: string; 
    details: string 
  }
): Promise<Corporation>{
  return await prisma.corporation.update({
    where: {id},
    data: {
      isClaimed: true,
      hashedPassword: data.hashedPassword,
      name: data.name,
      details: data.details,
    },
  });
};

export {findCorpByEmail, findCorpById, claimCorp, createCorp }