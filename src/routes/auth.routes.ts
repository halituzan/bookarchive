const router = require("express").Router();

import { CONFIG } from "../config";
import { login, logOut, register } from "../middlewares/auth.middleware";

router.post(`${CONFIG.apiVersion}/login`, login);
router.post(`${CONFIG.apiVersion}/register`, register);
router.get(`${CONFIG.apiVersion}/logout`, logOut);


export { router as authRoutes };

