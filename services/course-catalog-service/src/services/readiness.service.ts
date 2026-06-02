import prisma from "../db/prisma";

export async function getReadinessStatus() {
  await prisma.$queryRaw`SELECT 1`;

  return {
    status: "ready",
    service: "course-catalog-service",
    database: "ok"
  };
}
