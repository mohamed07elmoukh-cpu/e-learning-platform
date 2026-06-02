import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const requestId = req.header("x-request-id")?.trim() || crypto.randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const startedAt = Date.now();
  logger.info({ requestId, method: req.method, path: req.path }, "request started");

  res.on("finish", () => {
    logger.info(
      {
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt
      },
      "request completed"
    );
  });

  next();
}
