import { Router } from "express";
import {
  forgotPassword,
  login,
  logout,
  me,
  readiness,
  refresh,
  register,
  resetPassword,
  updateProfile
} from "./auth.controller";

export const authRouter = Router();

authRouter.get("/readiness", readiness);

authRouter.post(["/register", "/auth/register"], register);
authRouter.post(["/login", "/auth/login"], login);
authRouter.post(["/refresh", "/auth/refresh"], refresh);
authRouter.post(["/logout", "/auth/logout"], logout);
authRouter.get(["/me", "/auth/me"], me);
authRouter.post(["/auth/forgot-password", "/forgot-password"], forgotPassword);
authRouter.post(["/auth/reset-password", "/reset-password"], resetPassword);
authRouter.put(["/profile", "/auth/profile"], updateProfile);
