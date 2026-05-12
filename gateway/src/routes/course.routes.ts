import { Response, Router } from "express";
import * as courseClient from "../clients/course.client";

export const courseRouter = Router();

const mockCourses = [
  { id: "c1", title: "React Basics", description: "Intro React", level: "Beginner" },
  { id: "c2", title: "TypeScript Fundamentals", description: "TS for frontend", level: "Intermediate" }
];

function sendProxy(res: Response, status: number, data: unknown) {
  if (typeof data === "string") {
    return res.status(status).json({ message: data });
  }
  return res.status(status).json(data);
}

courseRouter.get("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization ?? "";
    const result = await courseClient.listCourses({ Authorization: authHeader });
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    if ((error as courseClient.ServiceUnavailableError).code === "SERVICE_UNAVAILABLE") {
      console.log("[course] fallback mock used (service unavailable)");
      return res.status(200).json(mockCourses);
    }

    return res.status(502).json({
      message: "Course service unavailable",
      details: (error as Error).message
    });
  }
});

courseRouter.get("/:id", async (req, res) => {
  try {
    const authHeader = req.headers.authorization ?? "";
    const result = await courseClient.getCourseById(req.params.id, { Authorization: authHeader });
    return sendProxy(res, result.status, result.data);
  } catch (error) {
    if ((error as courseClient.ServiceUnavailableError).code === "SERVICE_UNAVAILABLE") {
      const mock = mockCourses.find((course) => course.id === req.params.id);
      if (!mock) {
        return res.status(404).json({ message: "Course not found" });
      }
      console.log("[course] fallback mock used (service unavailable)");
      return res.status(200).json(mock);
    }

    return res.status(502).json({
      message: "Course service unavailable",
      details: (error as Error).message
    });
  }
});
