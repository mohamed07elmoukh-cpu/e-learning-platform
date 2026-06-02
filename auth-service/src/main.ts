import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { logger } from "./lib/logger";
import { requestContext } from "./middleware/request-context";
import { authRouter } from "./modules/auth/auth.routes";
import { seedDefaultUsers } from "./modules/auth/auth.service";

const app = express();

app.use(express.json());
app.use(requestContext);
app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
app.options("*", cors({ origin: env.CORS_ORIGINS, credentials: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

app.use(authRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ requestId: req.requestId, err }, "unhandled auth error");
  res.status(500).json({
    message: "Internal server error",
    details: err.message
  });
});

async function start() {
  await seedDefaultUsers();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "auth service listening");
  });
}

start().catch((error) => {
  logger.fatal({ err: error }, "failed to start auth service");
  process.exit(1);
});
