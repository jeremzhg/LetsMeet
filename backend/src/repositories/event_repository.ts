import { Prisma, Events } from "../generated/prisma/client";
import { prisma } from "../configs/db";

export async function getAllEvents(): Promise<Events[]> {
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

export async function createEvent(data: {
  title: string;
  date: string | Date;
  details: string;
  organizationID: string;
}): Promise<Events> {
  return await prisma.events.create({
    data: {
      title: data.title,
      details: data.details,
      date: new Date(data.date),

      organization: {
        connect: { id: data.organizationID }
      }
    }
  });
}