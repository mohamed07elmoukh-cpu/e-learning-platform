import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

type JwtPayload = {
  sub: string;
  email: string;
  role: Role;
  fullName: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(requiredRoles?: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing Authorization header" });
    }

    const token = header.slice("Bearer ".length).trim();
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = payload;
    } catch (error) {
      return res.status(401).json({
        message: "Invalid token",
        details: (error as Error).message
      });
    }

    if (requiredRoles && requiredRoles.length > 0) {
      const role = req.user?.role;
      if (!role || !requiredRoles.includes(role)) {
        return res.status(403).json({ message: "Insufficient role" });
      }
    }

    return next();
  };
}

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ message: "Insufficient role" });
    }
    return next();
  };
}
