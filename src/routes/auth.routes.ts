const router = require("express").Router();

import { CONFIG } from "../config";
import {
  changePassword,
  login,
  logOut,
  register,
} from "../middlewares/auth.middleware";

router.post(`${CONFIG.version}/login`, login);
router.post(`${CONFIG.version}/register`, register);
router.post(`${CONFIG.version}/changePassword`, changePassword);
router.get(`${CONFIG.version}/logout`, logOut);

export { router as authRoutes };
