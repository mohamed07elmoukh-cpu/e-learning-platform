
import { Request, Response } from "express";
import * as service from "./admin.service";

function handleError(res: Response, error: unknown) {
  const err = error as { status?: number; message?: string; details?: string; code?: string; meta?: { target?: string[] } };
  if (err?.code === "P2002") {
    return res.status(400).json({ message: "Unique constraint failed", details: err.meta?.target });
  }
  if (err?.status) {
    return res.status(err.status).json({ message: err.message ?? "Request error", details: err.details });
  }
  return res.status(500).json({ message: "Internal server error", details: (error as Error)?.message });
}

export async function createCourse(req: Request, res: Response) {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const course = await service.createCourse(req.body, user);
    return res.status(201).json({ course });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateCourse(req: Request, res: Response) {
  try {
    const course = await service.updateCourse(String(req.params.courseId), req.body);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.json({ course });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteCourse(req: Request, res: Response) {
  try {
    const course = await service.deleteCourse(String(req.params.courseId));
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.json({ message: "Course deleted" });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function publishCourse(req: Request, res: Response) {
  try {
    const course = await service.setCoursePublished(String(req.params.courseId), true);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.json({ course });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function unpublishCourse(req: Request, res: Response) {
  try {
    const course = await service.setCoursePublished(String(req.params.courseId), false);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.json({ course });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function createModule(req: Request, res: Response) {
  try {
    const module = await service.createModule(String(req.params.courseId), req.body);
    if (!module) {
      return res.status(404).json({ message: "Course not found" });
    }
    return res.status(201).json({ module });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateModule(req: Request, res: Response) {
  try {
    const module = await service.updateModule(String(req.params.moduleId), req.body);
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    return res.json({ module });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteModule(req: Request, res: Response) {
  try {
    const module = await service.deleteModule(String(req.params.moduleId));
    if (!module) {
      return res.status(404).json({ message: "Module not found" });
    }
    return res.json({ message: "Module deleted" });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function createLesson(req: Request, res: Response) {
  try {
    const lesson = await service.createLesson(String(req.params.moduleId), req.body);
    if (!lesson) {
      return res.status(404).json({ message: "Module not found" });
    }
    return res.status(201).json({ lesson });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function updateLesson(req: Request, res: Response) {
  try {
    const lesson = await service.updateLesson(String(req.params.lessonId), req.body);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    return res.json({ lesson });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function deleteLesson(req: Request, res: Response) {
  try {
    const lesson = await service.deleteLesson(String(req.params.lessonId));
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }
    return res.json({ message: "Lesson deleted" });
  } catch (error) {
    return handleError(res, error);
  }
}
