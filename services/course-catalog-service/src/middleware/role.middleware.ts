import { NextFunction, Request, Response } from "express";

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole || userRole !== role) {
      return res.status(403).json({ message: "Insufficient role" });
    }
    return next();
  };
}
