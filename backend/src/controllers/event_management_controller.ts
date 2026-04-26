import { Request, Response } from "express";
import * as EventRepo from "../repositories/prisma_event_repository";
import { getEntityImagePath, setEntityImageFromUpload } from "../utils/image_storage";

const attachEventImagePath = async <T extends { id: string }>(events: T[]) => {
  return Promise.all(
    events.map(async (event) => ({
      ...event,
      imagePath: await getEntityImagePath("events", event.id),
    }))
  );
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    let events = await EventRepo.getAllEvents();
    events = await attachEventImagePath(events);

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
    const {
      title,
      date,
      details,
      country,
      city,
      venue,
      expectedParticipants,
      targetSponsorValue,
      packages,
    } = req.body;

    const organizationID = (req as any).user.id;
    const role = (req as any).user.role;

    if (role !== "org") {
      return res.status(403).json({
        message: "Forbidden: Only organizations can create events.",
      });
    }
    if (
      !title ||
      !date ||
      !details ||
      !country ||
      !city ||
      !venue ||
      expectedParticipants == null ||
      targetSponsorValue == null
    ) {
      return res.status(400).json({
        message:
          "Missing required fields: title, date, details, country, city, venue, expectedParticipants, or targetSponsorValue",
      });
    }

    const newEvent = await EventRepo.createEvent({
      title,
      date,
      details,
      country,
      city,
      venue,
      expectedParticipants: Number(expectedParticipants),
      targetSponsorValue: Number(targetSponsorValue),
      organizationID,
      packages,
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

    const event = await EventRepo.findEventById(String(id));

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const imagePath = await getEntityImagePath("events", event.id);

    return res.status(200).json({
      success: true,
      data: {
        ...event,
        imagePath,
      },
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
    const {
      title,
      date,
      details,
      country,
      city,
      venue,
      expectedParticipants,
      targetSponsorValue,
      status,
      packages,
    } = req.body;

    const updatedEvent = await EventRepo.updateEvent(id as string, {
      title,
      date,
      details,
      country,
      city,
      venue,
      expectedParticipants: expectedParticipants ? Number(expectedParticipants) : undefined,
      targetSponsorValue: targetSponsorValue ? Number(targetSponsorValue) : undefined,
      status,
      packages,
    });

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

    let events = await EventRepo.getEventsByOrgID(userID as string);
    events = await attachEventImagePath(events);

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

    let events = await EventRepo.getEventsByCorpID(userID as string);
    events = await attachEventImagePath(events);

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

    let events = await EventRepo.getPastEventsForCorporation(
      corpID as string, 
      eventStatus as string, 
      partnerStatus as string
    );
    events = await attachEventImagePath(events);

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

export const uploadEventImagePath = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!id) {
      return res.status(400).json({ error: "event id is required" });
    }

    if (!file) {
      return res.status(400).json({ error: "image file is required" });
    }

    const imagePath = await setEntityImageFromUpload(
      "events",
      String(id),
      file.originalname,
      file.buffer
    );

    return res.status(200).json({
      success: true,
      data: { imagePath },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(409).json({ error: error.message });
    }
    return res.status(500).json({ error: "internal server error" });
  }
};