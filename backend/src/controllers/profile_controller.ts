import { Request, Response } from "express";
import * as OrgRepo from "../repositories/prisma_organization_repository";
import * as CorpRepo from "../repositories/prisma_corporation_repository";
import { getEntityImagePath, setEntityImageFromUpload } from "../utils/image_storage";

export const getOrgProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== "org") {
      return res.status(403).json({ error: "forbidden" });
    }

    const org = await OrgRepo.findOrgById(user.id);
    if (!org) {
      return res.status(404).json({ error: "organization not found" });
    }

    const imagePath = await getEntityImagePath("organizations", org.id);

    return res.status(200).json({
      success: true,
      data: {
        id: org.id,
        name: org.name,
        email: org.email,
        details: org.details,
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

export const uploadOrgProfileImagePath = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== "org") {
      return res.status(403).json({ error: "forbidden" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "image file is required" });
    }

    const imagePath = await setEntityImageFromUpload(
      "organizations",
      user.id,
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

export const getCorpProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== "corp") {
      return res.status(403).json({ error: "forbidden" });
    }

    const corp = await CorpRepo.findCorpById(user.id);
    if (!corp) {
      return res.status(404).json({ error: "corporation not found" });
    }

    const imagePath = await getEntityImagePath("corporations", corp.id);

    return res.status(200).json({
      success: true,
      data: {
        id: corp.id,
        name: corp.name,
        email: corp.email,
        details: corp.details,
        category: corp.category,
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

export const updateCorpProfile = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== "corp") {
      return res.status(403).json({ error: "forbidden" });
    }

    const { name, details, category } = req.body;
    if (!name || !details || !category) {
      return res.status(400).json({ error: "name, details, and category are required" });
    }

    const updatedCorp = await CorpRepo.updateCorpById(user.id, {
      name: String(name),
      details: String(details),
      category: String(category),
    });

    const imagePath = await getEntityImagePath("corporations", updatedCorp.id);

    return res.status(200).json({
      success: true,
      data: {
        id: updatedCorp.id,
        name: updatedCorp.name,
        email: updatedCorp.email,
        details: updatedCorp.details,
        category: updatedCorp.category,
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

export const uploadCorpProfileImagePath = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== "corp") {
      return res.status(403).json({ error: "forbidden" });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "image file is required" });
    }

    const imagePath = await setEntityImageFromUpload(
      "corporations",
      user.id,
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

export const uploadCorpProfileImagePathById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const file = req.file;

    if (!id) {
      return res.status(400).json({ error: "corporation id is required" });
    }

    if (!file) {
      return res.status(400).json({ error: "image file is required" });
    }

    const imagePath = await setEntityImageFromUpload(
      "corporations",
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

export const getCorpProfileById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "corporation id is required" });
    }

    const corp = await CorpRepo.findCorpById(String(id));
    if (!corp) {
      return res.status(404).json({ error: "corporation not found" });
    }

    const imagePath = await getEntityImagePath("corporations", corp.id);

    return res.status(200).json({
      success: true,
      data: {
        id: corp.id,
        name: corp.name,
        email: corp.email,
        details: corp.details,
        category: corp.category,
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
