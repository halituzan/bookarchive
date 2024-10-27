const router = require("express").Router();

import { CONFIG } from "../config";
import { login, logOut, me, register } from "../middlewares/auth.middleware";

router.post(`${CONFIG.apiVersion}/login`, login);
router.post(`${CONFIG.apiVersion}/register`, register);
router.get(`${CONFIG.apiVersion}/logout`, logOut);
router.get(`${CONFIG.apiVersion}/me`, me);

export { router as authRoutes };
