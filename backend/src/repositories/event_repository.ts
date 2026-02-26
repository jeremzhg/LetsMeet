import { Prisma, Events } from "../generated/prisma/client";
import { prisma } from "../configs/db";

async function getAllEvents(): Promise<Events[]> {
    try {
      return await prisma.events.findMany({
        include: {
          organization: {
            select: {
              name: true,
              email: true,
            },
          },
          _count: {
            select: { partners: true },
          },
        },
        orderBy: {
          date: 'desc',
        },
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      throw new Error("Could not retrieve events from the database.");
    }
}

export { getAllEvents }