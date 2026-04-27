import { Request, Response } from "express";
import {
  getGeneralMatchScoresByCorporationID,
  getGeneralMatchScoresByOrganizationID,
  getMatchScoreByEventID,
} from "../repositories/prisma_matchscore_repository";
import { matchingService } from "../services/event_matching_service";
import { generalMatchingService } from "../services/general_matching_service";

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

async function getGeneralMatchesForOrganization(req: Request, res: Response) {
  try {
    const organizationID = req.params.organizationID;
    if (!organizationID) return res.status(400).json({ error: "organizationID is required" });

    let matchScores = await getGeneralMatchScoresByOrganizationID(String(organizationID));

    if (matchScores.length === 0) {
      await generalMatchingService(String(organizationID), "organization");
      matchScores = await getGeneralMatchScoresByOrganizationID(String(organizationID));
    }

    return res.status(200).json({
      success: true,
      count: matchScores.length,
      data: matchScores,
    });
  } catch (error) {
    console.error("Error fetching/generating general organization match scores:", error);
    return res.status(500).json({ error: "Failed to fetch general match scores" });
  }
}

async function updateGeneralMatchesForOrganization(req: Request, res: Response) {
  try {
    const organizationID = req.params.organizationID;
    if (!organizationID) return res.status(400).json({ error: "organizationID is required" });

    await generalMatchingService(String(organizationID), "organization");
    const matchScores = await getGeneralMatchScoresByOrganizationID(String(organizationID));

    return res.status(200).json({
      success: true,
      message: "General match scores successfully updated.",
      count: matchScores.length,
      data: matchScores,
    });
  } catch (error) {
    console.error("Error updating general organization match scores:", error);
    return res.status(500).json({ error: "Failed to update general match scores" });
  }
}

async function getGeneralMatchesForCorporation(req: Request, res: Response) {
  try {
    const corporationID = req.params.corporationID;
    if (!corporationID) return res.status(400).json({ error: "corporationID is required" });

    let matchScores = await getGeneralMatchScoresByCorporationID(String(corporationID));

    if (matchScores.length === 0) {
      await generalMatchingService(String(corporationID), "corporation");
      matchScores = await getGeneralMatchScoresByCorporationID(String(corporationID));
    }

    return res.status(200).json({
      success: true,
      count: matchScores.length,
      data: matchScores,
    });
  } catch (error) {
    console.error("Error fetching/generating general corporation match scores:", error);
    return res.status(500).json({ error: "Failed to fetch general match scores" });
  }
}

async function updateGeneralMatchesForCorporation(req: Request, res: Response) {
  try {
    const corporationID = req.params.corporationID;
    if (!corporationID) return res.status(400).json({ error: "corporationID is required" });

    await generalMatchingService(String(corporationID), "corporation");
    const matchScores = await getGeneralMatchScoresByCorporationID(String(corporationID));

    return res.status(200).json({
      success: true,
      message: "General match scores successfully updated.",
      count: matchScores.length,
      data: matchScores,
    });
  } catch (error) {
    console.error("Error updating general corporation match scores:", error);
    return res.status(500).json({ error: "Failed to update general match scores" });
  }
}

export {
  getMatchesForEvent,
  updateMatchesForEvent,
  getGeneralMatchesForOrganization,
  updateGeneralMatchesForOrganization,
  getGeneralMatchesForCorporation,
  updateGeneralMatchesForCorporation,
};