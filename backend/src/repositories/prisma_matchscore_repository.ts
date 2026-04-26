import { MatchScore } from "../generated/prisma/client";
import { prisma } from "../configs/db";

async function upsertMatchScore(
  eventID: string,
  corporationID: string,
  score: number,
  reasoning: string
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
    },
    create: {
      eventID,
      corporationID,
      score,
      reasoning,
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

export { upsertMatchScore, getMatchScoreByEventID };