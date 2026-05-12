import { Router } from "express";
import { getCourse, listCourses } from "./catalog.controller";

export const catalogRouter = Router();

catalogRouter.get("/courses", listCourses);
catalogRouter.get("/courses/:courseId", getCourse);
