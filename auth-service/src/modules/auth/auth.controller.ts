import { Request, Response } from "express";
import { logger } from "../../lib/logger";
import * as authService from "./auth.service";

function handleError(req: Request, res: Response, error: unknown) {
  const requestId = req.requestId;
  logger.error({ requestId, err: error }, "auth request failed");

  if (authService.isHttpError(error)) {
    return res.status(error.status ?? 500).json({
      message: error.message,
      details: error.details
    });
  }

  return res.status(500).json({
    message: "Internal server error",
    details: (error as Error).message
  });
}

export async function register(req: Request, res: Response) {
  try {
    const payload = await authService.registerUser(req.body);
    return res.status(201).json(payload);
  } catch (error) {
    return handleError(req, res, error);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const payload = await authService.loginUser(req.body, authService.getRequestMeta(req));
    return res.json(payload);
  } catch (error) {
    return handleError(req, res, error);
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const payload = await authService.refreshSession(req.body);
    return res.json(payload);
  } catch (error) {
    return handleError(req, res, error);
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const payload = await authService.logoutUser(req.body);
    return res.json(payload);
  } catch (error) {
    return handleError(req, res, error);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const payload = await authService.forgotPassword(req.body);
    return res.json(payload);
  } catch (error) {
    return handleError(req, res, error);
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const payload = await authService.resetPassword(req.body);
    return res.json(payload);
  } catch (error) {
    return handleError(req, res, error);
  }
}

export async function me(req: Request, res: Response) {
  try {
    const payload = await authService.getCurrentUser(req.headers.authorization);
    return res.json(payload);
  } catch (error) {
    return handleError(req, res, error);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const payload = await authService.updateProfile(req.headers.authorization, req.body);
    return res.json(payload);
  } catch (error) {
    return handleError(req, res, error);
  }
}

export async function readiness(_req: Request, res: Response) {
  try {
    const payload = await authService.readinessCheck();
    return res.json(payload);
  } catch (error) {
    logger.error({ err: error }, "auth readiness failed");
    return res.status(503).json({
      status: "degraded",
      service: "auth-service",
      details: (error as Error).message
    });
  }
}
