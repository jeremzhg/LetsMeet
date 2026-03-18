import { Router } from "express";
import { createPartner, updatePartner } from "../controllers/partner_controller";

const router = Router();

router.post("/", createPartner);
router.put("/", updatePartner);

export { router as PartnerRouter };