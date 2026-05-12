import { Response, Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import * as authClient from "../clients/auth.client";

export const authRouter = Router();
const refreshTokens = new Set<string>();

function sendProxy(res: Response, status: number, data: unknown) {
  if (typeof data === "string") {
    return res.status(status).json({ message: data });
  }
  return res.status(status).json(data);
}

authRouter.post("/register", async (req, res) => {
  try {
    const result = await authClient.register(req.body);
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    return res.status(502).json({
      message: "Auth service unavailable",
      details: (error as Error).message
    });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const result = await authClient.login(req.body);
    const payload = result.data as { refreshToken?: string } | null;
    if (payload?.refreshToken) {
      refreshTokens.add(payload.refreshToken);
    }
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    return res.status(502).json({
      message: "Auth service unavailable",
      details: (error as Error).message
    });
  }
});

authRouter.post("/refresh", async (req, res) => {
  const refreshToken = (req.body as { refreshToken?: string } | null)?.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: "Missing refreshToken" });
  }

  try {
    const result = await authClient.refresh(req.body);
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    if (!refreshTokens.has(refreshToken)) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }
    return res.status(502).json({
      message: "Auth service unavailable",
      details: (error as Error).message
    });
  }
});

authRouter.post("/logout", async (req, res) => {
  const refreshToken = (req.body as { refreshToken?: string } | null)?.refreshToken;
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }
  try {
    const result = await authClient.logout(req.body);
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    return res.status(200).json({
      message: "Logged out (gateway fallback)"
    });
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const result = await authClient.forgotPassword(req.body);
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    return res.status(502).json({
      message: "Auth service unavailable",
      details: (error as Error).message
    });
  }
});

authRouter.post("/reset-password", async (req, res) => {
  try {
    const result = await authClient.resetPassword(req.body);
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    return res.status(502).json({
      message: "Auth service unavailable",
      details: (error as Error).message
    });
  }
});

authRouter.get("/me", authMiddleware(), async (req, res) => {
  try {
    const authHeader = req.headers.authorization ?? "";
    const result = await authClient.me({ Authorization: authHeader });
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    return res.status(502).json({
      message: "Auth service unavailable",
      details: (error as Error).message
    });
  }
});

authRouter.put("/profile", authMiddleware(), async (req, res) => {
  try {
    const authHeader = req.headers.authorization ?? "";
    const result = await authClient.updateProfile(req.body, { Authorization: authHeader });
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    return res.status(502).json({
      message: "Auth service unavailable",
      details: (error as Error).message
    });
  }
});
