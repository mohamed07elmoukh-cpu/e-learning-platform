import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { createCorsOptions } from "./config/cors";
import prisma from "./db/prisma";
import { catalogRouter } from "./modules/catalog/catalog.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { authMiddleware } from "./middleware/auth.middleware";
import { requireRole } from "./middleware/role.middleware";

const app = express();
app.use(express.json());

const corsOptions = createCorsOptions();
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use("/catalog", catalogRouter);
app.use("/catalog/admin", authMiddleware(), requireRole("ADMIN"), adminRouter);

app.get("/health", (_req, res) => {
  void prisma;
  res.json({ status: "ok", service: "course-catalog" });
});

app.get("/", (_req, res) => {
  res.json({ service: "course-catalog", version: "1.0.0" });
});

app.listen(env.PORT, () => {
  console.log(`Course catalog service listening on http://localhost:${env.PORT}`);
});
