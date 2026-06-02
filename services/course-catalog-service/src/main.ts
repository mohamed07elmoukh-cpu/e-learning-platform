import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { createCorsOptions } from "./config/cors";
import prisma from "./db/prisma";
import { catalogRouter } from "./modules/catalog/catalog.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { requireRole } from "./middleware/role.middleware";
import { seedDefaultCatalog } from "./seed/defaultCatalog";
import { requestContext } from "./middleware/request-context";
import { logger } from "./lib/logger";
import { getReadinessStatus } from "./services/readiness.service";

const app = express();
app.use(express.json());
app.use(requestContext);

const corsOptions = createCorsOptions();
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/catalog", catalogRouter);
app.use("/catalog/admin", authMiddleware(), requireRole("ADMIN"), adminRouter);

app.get("/health", (_req, res) => {
  void prisma;
  res.json({ status: "ok", service: "course-catalog" });
});

app.get("/readiness", async (_req, res) => {
  try {
    const readiness = await getReadinessStatus();
    res.json(readiness);
  } catch (error) {
    logger.error({ err: error }, "course-catalog readiness failed");
    res.status(503).json({
      status: "degraded",
      service: "course-catalog-service",
      details: (error as Error).message
    });
  }
});

app.get("/", (_req, res) => {
  res.json({ service: "course-catalog", version: "1.0.0" });
});

async function start() {
  await seedDefaultCatalog();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, "course catalog service listening");
  });
}

start().catch((error) => {
  logger.fatal({ err: error }, "failed to start course catalog service");
  process.exit(1);
});
