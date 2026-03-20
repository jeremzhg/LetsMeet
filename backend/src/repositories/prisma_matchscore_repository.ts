import { MatchScore } from "../generated/prisma/client";
import { prisma } from "../configs/db";

export async function upsertMatchScore(
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
