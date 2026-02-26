import { Request, Response } from "express";
import * as EventRepo from "../repositories/event_repository";

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await EventRepo.getAllEvents();

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, date, details } = req.body;

    const organizationID = (req as any).user.id;
    const role = (req as any).user.role;

    if (role !== "org") {
      return res.status(403).json({
        message: "Forbidden: Only organizations can create events.",
      });
    }
    if (!title || !date || !organizationID) {
      return res.status(400).json({
        message: "Missing required fields: title, date, or organizationID",
      });
    }

    const newEvent = await EventRepo.createEvent({
      title,
      date,
      details,
      organizationID,
    });

    return res.status(201).json({
      success: true,
      data: newEvent,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const event = await EventRepo.findEventById(id as string);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedEvent = await EventRepo.updateEvent(id as string, updateData);

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
};
