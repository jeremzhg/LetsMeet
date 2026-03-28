import { Request, Response, NextFunction } from "express";
import * as EventRepo from "../repositories/prisma_event_repository";

export const isEventOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    if (!user || !user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (user.role !== "org") {
      return res.status(403).json({ error: "Forbidden: Only organizations can update events" });
    }

    const event = await EventRepo.findEventById(id as string);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (event.organizationID !== user.id) {
      return res.status(403).json({ error: "Forbidden: You do not own this event" });
    }

    next();
  } catch (error) {
    console.error("isEventOwner error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
