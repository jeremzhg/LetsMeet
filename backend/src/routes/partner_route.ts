import { Router } from "express";
import { createPartner, updatePartner, getAllPartners, getPartnerDetails, getMyPartners } from "../controllers/partner_controller";
import { authMiddleware } from "../middleware/auth_middleware";

const router = Router();

router.post("/", authMiddleware, createPartner);
router.put("/", authMiddleware, updatePartner);
router.get("/", authMiddleware, getMyPartners);
router.get("/all/:eventID", getAllPartners);
router.get("/details/:eventID", getPartnerDetails);

export { router as PartnerRouter };