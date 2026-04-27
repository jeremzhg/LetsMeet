import { Router } from "express";
import {
	getGeneralMatchesForCorporation,
	getGeneralMatchesForOrganization,
	getMatchesForCorporation,
	getMatchesForEvent,
	updateGeneralMatchesForCorporation,
	updateGeneralMatchesForOrganization,
	updateMatchesForEvent,
} from "../controllers/matchscore_controller";

const router = Router();

router.get("/general/org/:organizationID", getGeneralMatchesForOrganization);
router.put("/general/org/:organizationID", updateGeneralMatchesForOrganization);

router.get("/general/corp/:corporationID", getGeneralMatchesForCorporation);
router.put("/general/corp/:corporationID", updateGeneralMatchesForCorporation);

router.get("/corp/:corporationID/events", getMatchesForCorporation);

router.get("/:eventID", getMatchesForEvent);
router.put("/:eventID", updateMatchesForEvent);

export {router as MatchingRouter};