import { Request, Response } from "express";
import * as EventRepo from "../repositories/prisma_event_repository";

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
    const { title, date, details, country, city, expectedParticipants } = req.body;

    const organizationID = (req as any).user.id;
    const role = (req as any).user.role;

    if (role !== "org") {
      return res.status(403).json({
        message: "Forbidden: Only organizations can create events.",
      });
    }
    if (!title || !date || !details || !country || !city || expectedParticipants == null) {
      return res.status(400).json({
        message: "Missing required fields: title, date, details, country, city, or expectedParticipants",
      });
    }

    const newEvent = await EventRepo.createEvent({
      title,
      date,
      details,
      country,
      city,
      expectedParticipants: Number(expectedParticipants),
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

export const getOrgEvents = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    if (!userID) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const events = await EventRepo.getEventsByOrgID(userID as string);

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

export const getCorpEvents = async (req: Request, res: Response) => {
  try {
    const { userID } = req.params;

    if (!userID) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const events = await EventRepo.getEventsByCorpID(userID as string);

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

export const getEventPartners = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const partners = await EventRepo.getPartnersByEventID(id as string);

    return res.status(200).json({
      success: true,
      count: partners.length,
      data: partners,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
};

export const getPastEventsForCorporation = async (req: Request, res: Response) => {
  try {
    const { corpID } = req.params;
    const { eventStatus, partnerStatus } = req.query;

    if (!corpID) {
      return res.status(400).json({ error: "Corporation ID is required" });
    }

    const events = await EventRepo.getPastEventsForCorporation(
      corpID as string, 
      eventStatus as string, 
      partnerStatus as string
    );

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