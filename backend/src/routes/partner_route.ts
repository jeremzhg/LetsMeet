import { Router } from "express";
import { createPartner, updatePartner, getAllPartners, getPartnerDetails } from "../controllers/partner_controller";

const router = Router();

router.post("/", createPartner);
router.put("/", updatePartner);
router.get("/", getAllPartners);
router.get("/:eventID/:corporationID", getPartnerDetails);

export { router as PartnerRouter };