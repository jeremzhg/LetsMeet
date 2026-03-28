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
        packages: true,
      },
      orderBy: {
        date: "desc",
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
  country: string;
  city: string;
  expectedParticipants: number;
  organizationID: string;
  packages?: { title: string; cost: number; details: string }[];
}): Promise<Events> {
  return await prisma.events.create({
    data: {
      title: data.title,
      details: data.details,
      date: new Date(data.date),
      country: data.country,
      city: data.city,
      expectedParticipants: data.expectedParticipants,
      organization: {
        connect: { id: data.organizationID },
      },
      ...(data.packages && data.packages.length > 0 && {
        packages: {
          create: data.packages,
        },
      }),
    },
  });
}

export async function findEventById(id: string): Promise<Events | null> {
  return await prisma.events.findUnique({
    where: { id },
    include: {
      organization: {
        select: {
          name: true,
          email: true,
        },
      },
      packages: true,
    },
  });
}

export async function updateEvent(
  id: string,
  data: Partial<{
    title: string;
    date: string | Date;
    details: string;
    country: string;
    city: string;
    expectedParticipants: number;
    status: string;
    packages: { id?: string; title: string; cost: number; details: string }[];
  }>
): Promise<Events> {
  try {
    return await prisma.events.update({
      where: { id },
      data: {
        ...data,
        packages: undefined,
        ...(data.date && { date: new Date(data.date) }),
        ...(data.packages && {
          packages: {
            deleteMany: {
              id: {
                notIn: data.packages.filter((p) => p.id).map((p) => p.id as string),
              },
            },
            create: data.packages
              .filter((p) => !p.id)
              .map((p) => ({
                title: p.title,
                cost: p.cost,
                details: p.details,
              })),
            upsert: data.packages
              .filter((p) => p.id)
              .map((p) => ({
                where: { id: p.id as string },
                update: { title: p.title, cost: p.cost, details: p.details },
                create: { title: p.title, cost: p.cost, details: p.details },
              })),
          },
        }),
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new Error("Event not found or already deleted.");
    }
    console.error("Error updating event:", error);
    throw new Error("Could not update the event.");
  }
}

export async function getEventsByOrgID(orgID: string): Promise<Events[]> {
  return await prisma.events.findMany({
    where: { organizationID: orgID },
    include: { packages: true },
    orderBy: { date: "desc" },
  });
}

export async function getEventsByCorpID(corpID: string): Promise<Events[]> {
  return await prisma.events.findMany({
    where: {
      partners: {
        some: { corporationID: corpID },
      },
    },
    include: {
      organization: {
        select: {
          name: true,
          email: true,
        },
      },
      packages: true,
      partners: {
        where: { corporationID: corpID },
        select: { status: true },
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function getPartnersByEventID(eventID: string) {
  return await prisma.partners.findMany({
    where: { eventID },
    include: {
      corporation: {
        select: {
          id: true,
          name: true,
          email: true,
          details: true,
          category: true,
        },
      },
      package: true,
    },
  });
}

export async function getPastEventsForCorporation(
  corpID: string, 
  eventStatus?: string, 
  partnerStatus?: string
): Promise<Events[]> {
  return await prisma.events.findMany({
    where: {
      date: { lt: new Date() },
      ...(eventStatus && { status: eventStatus }),
      partners: {
        some: { 
          corporationID: corpID,
          ...(partnerStatus && { status: partnerStatus })
        },
      },
    },
    include: {
      organization: {
        select: {
          name: true,
          email: true,
        },
      },
      partners: {
        where: { corporationID: corpID },
        include: { package: true },
      },
    },
    orderBy: { date: "desc" },
  });
}