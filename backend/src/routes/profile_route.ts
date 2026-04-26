import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth_middleware";
import {
  getCorpProfile,
  getCorpProfileById,
  getOrgProfile,
  uploadCorpProfileImagePathById,
  uploadCorpProfileImagePath,
  uploadOrgProfileImagePath,
} from "../controllers/profile_controller";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/org/profile", authMiddleware, getOrgProfile);
router.post("/org/profile/image", authMiddleware, upload.single("image"), uploadOrgProfileImagePath);

router.get("/corp/profile", authMiddleware, getCorpProfile);
router.post("/corp/profile/image", authMiddleware, upload.single("image"), uploadCorpProfileImagePath);
router.get("/corp/:id/profile", authMiddleware, getCorpProfileById);
router.post("/corp/:id/image", authMiddleware, upload.single("image"), uploadCorpProfileImagePathById);

export { router as ProfileRouter };
