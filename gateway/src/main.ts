import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { corsOptions } from "./config/cors";
import { authRouter } from "./routes/auth.routes";
import { courseRouter } from "./routes/course.routes";
import { authMiddleware, requireRole } from "./middleware/auth.middleware";
import { rateLimit } from "./middleware/rate-limit";
import { requestContext } from "./middleware/request-context";
import { logger } from "./lib/logger";
import { getReadinessStatus } from "./services/readiness.service";

const app = express();

app.use(requestContext);
app.use(express.json());
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(rateLimit({ windowMs: 60_000, max: 60 }));

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", service: "gateway", message: "root" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "gateway" });
});

app.get("/readiness", async (_req, res) => {
  const readiness = await getReadinessStatus();
  return res.status(readiness.ok ? 200 : 503).json({
    status: readiness.ok ? "ready" : "degraded",
    service: "gateway",
    ...readiness
  });
});

app.get("/admin/health", authMiddleware(), requireRole(["ADMIN"]), (_req, res) => {
  res.json({ status: "ok", service: "gateway", role: "ADMIN" });
});

app.use("/auth", authRouter);
app.use("/courses", authMiddleware(), courseRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, "unhandled gateway error");
  res.status(500).json({
    message: "Internal server error",
    details: err.message
  });
});

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, "gateway listening");
});

// Test URLs:
// GET http://localhost:8080/health
// POST http://localhost:8080/auth/login
// GET http://localhost:8080/courses
