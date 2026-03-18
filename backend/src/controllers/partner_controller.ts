import { Request, Response } from "express";
import * as PartnerRepo from "../repositories/prisma_partner_repository";

async function createPartner(req: Request, res: Response) {
  try {
    const { eventID, corporationID, packageID } = req.body;

    const newPartner = await PartnerRepo.createPartner({
      event: eventID,
      corporation: corporationID,
      status: "pending",
      package: packageID,
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
      package: packageID,
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

export { createPartner, updatePartner };