import { Request, Response } from "express";
import * as PartnerRepo from "../repositories/prisma_partner_repository";

async function createPartner(req: Request, res: Response) {
  try {
    const { eventID, corporationID, packageID } = req.body;

    const newPartner = await PartnerRepo.createPartner({
      eventID: eventID,
      corporationID: corporationID,
      status: "pending",
      packageID: packageID,
    });

    return res.status(201).json({
      success: true,
      data: newPartner,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
};

async function updatePartner(req: Request, res: Response){
  try {
    const { eventID, corporationID, packageID, status } = req.body;

    const updatedPartner = await PartnerRepo.updatePartner(eventID, corporationID, {
      packageID: packageID,
      status: status,
    });

    return res.status(200).json({
      success: true,
      data: updatedPartner,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
}

async function getAllPartners(req: Request, res: Response){
  try {
    const { eventID } = req.params;

    const partners = await PartnerRepo.getPartnersByEventId(String(eventID));

    return res.status(200).json({
      success: true,
      data: partners,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
}

async function getPartnerDetails(req: Request, res: Response){
  try {
    const { eventID } = req.params;
    const { corporationID } = req.body;

    const partner = await PartnerRepo.getPartnerById(String(eventID), corporationID);

    return res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
}

async function getMyPartners(req: Request, res: Response){
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: "unauthorized" });
    }

    let partners;
    if (user.role === 'org') {
      partners = await PartnerRepo.getPartnersByOrganizationId(user.id);
    } else if (user.role === 'corp') {
      partners = await PartnerRepo.getPartnersByCorporationId(user.id);
    } else {
      return res.status(403).json({ error: "invalid role" });
    }

    return res.status(200).json({
      success: true,
      data: partners,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
}

export { createPartner, updatePartner, getAllPartners, getPartnerDetails, getMyPartners };