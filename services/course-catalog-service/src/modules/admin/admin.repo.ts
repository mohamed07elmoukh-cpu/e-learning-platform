import prisma from "../../db/prisma";

type CourseInput = {
  title: string;
  description?: string | null;
  level?: string | null;
  thumbnailUrl?: string | null;
  createdBy: string;
};

type CourseUpdateInput = Partial<Omit<CourseInput, "createdBy">> & {
  isPublished?: boolean;
};

type ModuleInput = {
  courseId: string;
  title: string;
  orderIndex: number;
  isPublished?: boolean;
};

type ModuleUpdateInput = Partial<Omit<ModuleInput, "courseId">>;

type LessonInput = {
  moduleId: string;
  title: string;
  type: "VIDEO" | "PDF" | "TEXT" | "LINK" | "QUIZ";
  contentUrl?: string | null;
  contentText?: string | null;
  durationMin?: number | null;
  orderIndex: number;
  isPublished?: boolean;
};

type LessonUpdateInput = Partial<Omit<LessonInput, "moduleId">>;
export async function createCourse(data: CourseInput) {
  return prisma.course.create({ data });
}

export async function updateCourse(courseId: string, data: CourseUpdateInput) {
  return prisma.course.update({ where: { id: courseId }, data });
}

export async function deleteCourse(courseId: string) {
  return prisma.course.delete({ where: { id: courseId } });
}

export async function createModule(data: ModuleInput) {
  return prisma.module.create({ data });
}

export async function updateModule(moduleId: string, data: ModuleUpdateInput) {
  return prisma.module.update({ where: { id: moduleId }, data });
}

export async function deleteModule(moduleId: string) {
  return prisma.module.delete({ where: { id: moduleId } });
}
export async function createLesson(data: LessonInput) {
  return prisma.lesson.create({ data });
}

export async function updateLesson(lessonId: string, data: LessonUpdateInput) {
  return prisma.lesson.update({ where: { id: lessonId }, data });
}

export async function deleteLesson(lessonId: string) {
  return prisma.lesson.delete({ where: { id: lessonId } });
}
export async function setCoursePublished(courseId: string, isPublished: boolean) {
  return prisma.course.update({ where: { id: courseId }, data: { isPublished } });
}

export async function ensureCourseExists(courseId: string) {
  return prisma.course.findUnique({ where: { id: courseId } });
}

export async function ensureModuleExists(moduleId: string) {
  return prisma.module.findUnique({ where: { id: moduleId } });
}

export async function ensureLessonExists(lessonId: string) {
  return prisma.lesson.findUnique({ where: { id: lessonId } });
}
