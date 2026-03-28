import { Request, Response } from "express";
import { getMatchScoreByEventID } from "../repositories/prisma_matchscore_repository";
import { matchingService } from "../services/matching_service";

async function getMatchesForEvent(req: Request, res: Response) {
  try {
    const eventID = req.params.eventID;
    if (!eventID) return res.status(400).json({ error: "eventID is required" });

    let matchScores = await getMatchScoreByEventID(String(eventID));
    
    if (matchScores.length === 0) {
      await matchingService(String(eventID));
      matchScores = await getMatchScoreByEventID(String(eventID));
    }

    return res.status(200).json({
      success: true,
      count: matchScores.length,
      data: matchScores
    });

  } catch (error) {
    console.error("Error fetching/generating match scores:", error);
    return res.status(500).json({ error: "Failed to fetch match scores" });
  } 
}

async function updateMatchesForEvent(req: Request, res: Response) {
  try {
    const eventID = req.params.eventID;
    if (!eventID) return res.status(400).json({ error: "eventID is required" });
    await matchingService(String(eventID));
    const matchScores = await getMatchScoreByEventID(String(eventID));
    return res.status(200).json({
      success: true,
      message: "Match scores successfully updated.",
      count: matchScores.length,
      data: matchScores
    });
  } catch (error) {
    console.error("Error updating match scores:", error);
    return res.status(500).json({ error: "Failed to update match score" });
  }
}

export { getMatchesForEvent, updateMatchesForEvent };