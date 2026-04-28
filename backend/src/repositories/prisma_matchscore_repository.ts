import { GeneralMatchScore, MatchScore } from "../generated/prisma/client";
import { prisma } from "../configs/db";

async function upsertMatchScore(
  eventID: string,
  corporationID: string,
  score: number,
  reasoning: string,
  reasoning_corp: string
): Promise<MatchScore> {
  return await prisma.matchScore.upsert({
    where: {
      eventID_corporationID: {
        eventID,
        corporationID,
      },
    },
    update: {
      score,
      reasoning,
      reasoning_corp,
    },
    create: {
      eventID,
      corporationID,
      score,
      reasoning,
      reasoning_corp,
    },
  });
}

async function getMatchScoreByEventID(eventID: string) {
  return await prisma.matchScore.findMany({
    where: { eventID },
    include: {
      corporation: {
        select: {
          name: true,
          email: true,
          details: true,
          category: true,
        },
      },
    },
    orderBy: {
      score: "desc",
    },
  });
}

async function getMatchScoresByCorporationID(corporationID: string) {
  return await prisma.matchScore.findMany({
    where: { corporationID },
    include: {
      event: {
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          packages: true,
          _count: {
            select: { partners: true },
          },
        },
      },
    },
    orderBy: {
      score: "desc",
    },
  });
}

async function upsertGeneralMatchScore(
  corporationID: string,
  organizationID: string,
  matchScore: number,
  reasoning: string
): Promise<GeneralMatchScore> {
  return await prisma.generalMatchScore.upsert({
    where: {
      corporationID_organizationID: {
        corporationID,
        organizationID,
      },
    },
    update: {
      matchScore,
      reasoning,
    },
    create: {
      corporationID,
      organizationID,
      matchScore,
      reasoning,
    },
  });
}

async function getGeneralMatchScoresByOrganizationID(organizationID: string) {
  return await prisma.generalMatchScore.findMany({
    where: { organizationID },
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
    },
    orderBy: {
      matchScore: "desc",
    },
  });
}

async function getGeneralMatchScoresByCorporationID(corporationID: string) {
  return await prisma.generalMatchScore.findMany({
    where: { corporationID },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          email: true,
          details: true,
        },
      },
    },
    orderBy: {
      matchScore: "desc",
    },
  });
}

export {
  upsertMatchScore,
  getMatchScoreByEventID,
  getMatchScoresByCorporationID,
  upsertGeneralMatchScore,
  getGeneralMatchScoresByOrganizationID,
  getGeneralMatchScoresByCorporationID,
};