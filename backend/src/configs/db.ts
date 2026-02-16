import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connStr = process.env.DATABASE_URL;
const pool = new pg.Pool({connectionString: connStr});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({adapter});

async function connectDB(){
  try {
    await prisma.$connect();
    console.log("PrismaClient connected successfully.");
  } catch (err) {
    console.error("Error connecting to PrismaClient:", err);
  }
};

async function disconnectDB(){
  try {
    await prisma.$disconnect();
    console.log("PrismaClient disconnected successfully.");
  } catch (err) {
    console.error("Error disconnecting from PrismaClient:", err);
  }
};

export {connectDB, disconnectDB};