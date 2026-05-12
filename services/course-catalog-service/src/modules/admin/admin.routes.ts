import { Router } from "express";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson
} from "./admin.controller";

export const adminRouter = Router();

adminRouter.post("/courses", createCourse);
adminRouter.patch("/courses/:courseId", updateCourse);
adminRouter.delete("/courses/:courseId", deleteCourse);
adminRouter.post("/courses/:courseId/publish", publishCourse);
adminRouter.post("/courses/:courseId/unpublish", unpublishCourse);
adminRouter.post("/courses/:courseId/modules", createModule);
adminRouter.patch("/modules/:moduleId", updateModule);
adminRouter.delete("/modules/:moduleId", deleteModule);
adminRouter.post("/modules/:moduleId/lessons", createLesson);
adminRouter.patch("/lessons/:lessonId", updateLesson);
adminRouter.delete("/lessons/:lessonId", deleteLesson);
