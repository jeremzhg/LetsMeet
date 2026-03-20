import { Router } from "express";
import { getMatchesForEvent, updateMatchesForEvent } from "../controllers/matchscore_controller";

const router = Router();

router.get("/:eventID", getMatchesForEvent);
router.put("/:eventID", updateMatchesForEvent);

export {router as MatchingRouter};