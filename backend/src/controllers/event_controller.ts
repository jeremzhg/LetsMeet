import { Request, Response } from 'express';
import * as EventRepo from "../repositories/event_repository";

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await EventRepo.getAllEvents();

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
};