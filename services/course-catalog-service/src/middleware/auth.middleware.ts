import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type JwtUser = {
  sub: string;
  email: string;
  role: string;
};

export function authMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization ?? "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtUser;
      req.user = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role
      };
      return next();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
        details: (error as Error).message
      });
    }
  };
}
