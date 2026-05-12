import { Request, Response } from "express";
import { getCatalogCourse, listCatalogCourses } from "./catalog.service";

export async function listCourses(req: Request, res: Response) {
  try {
    const payload = await listCatalogCourses({
      page: req.query.page,
      pageSize: req.query.pageSize
    });
    return res.json(payload);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load courses",
      details: (error as Error).message
    });
  }
}

export async function getCourse(req: Request, res: Response) {
  try {
    const courseId = String(req.params.courseId);
    const course = await getCatalogCourse(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.json({ course });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load course",
      details: (error as Error).message
    });
  }
}
