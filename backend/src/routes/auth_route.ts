import { Router } from "express";
import { logout, verify } from "../controllers/auth_controller";
import { registerCorp, corpLogin } from "../controllers/corp_auth_controller";
import { registerOrg, orgLogin } from "../controllers/org_auth_controller";
import { authMiddleware } from "../middleware/auth_middleware";
const router = Router();

router.post("/corp/register", registerCorp)
router.post("/corp/login", corpLogin)
router.post("/org/register", registerOrg)
router.post("/org/login", orgLogin)
router.post("/logout", authMiddleware, logout)
router.get("/me", authMiddleware, verify)

export {router as AuthRouter}