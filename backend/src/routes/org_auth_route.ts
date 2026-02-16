import { Router } from "express";
import { logout } from "../controllers/auth_controller";
import { registerOrg, orgLogin } from "../controllers/org_auth_controller";

const router = Router();

router.post("/org/register", registerOrg)
router.post("/org/login", orgLogin)
router.post("/org/logout", logout)