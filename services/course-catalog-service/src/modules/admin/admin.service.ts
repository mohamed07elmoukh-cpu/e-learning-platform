import { ZodError } from "zod";
import { JwtUser } from "../../middleware/auth.middleware";
import * as repo from "./admin.repo";
import {
  createCourseSchema,
  createLessonSchema,
  createModuleSchema,
  updateCourseSchema,
  updateLessonSchema,
  updateModuleSchema
} from "./admin.schemas";

type HttpError = Error & { status?: number; details?: string };

function badRequest(message: string, details?: string): never {
  const error = new Error(message) as HttpError;
  error.status = 400;
  error.details = details;
  throw error;
}

function requireId(value: string | undefined, name: string) {
  if (!value) {
    badRequest(`${name} is required`);
  }
}

function formatZodError(error: ZodError) {
  const issue = error.issues[0];
  return issue ? `${issue.path.join(".") || "payload"}: ${issue.message}` : "Invalid payload";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

async function buildUniqueSlug(title: string, courseId?: string) {
  const base = slugify(title) || "course";
  let slug = base;
  let suffix = 2;

  while (true) {
    const existing = await repo.findCourseBySlug(slug);
    if (!existing || existing.id === courseId) {
      return slug;
    }
    slug = `${base}-${suffix}`;
    suffix += 1;
  }
}

function parseWithSchema<T>(schema: { parse: (payload: unknown) => T }, payload: unknown): T {
  try {
    return schema.parse(payload);
  } catch (error) {
    if (error instanceof ZodError) {
      badRequest("Invalid payload", formatZodError(error));
    }
    throw error;
  }
}

export async function createCourse(payload: unknown, user: JwtUser) {
  const body = parseWithSchema(createCourseSchema, payload);
  return repo.createCourse({
    ...body,
    slug: await buildUniqueSlug(body.title),
    createdBy: user.sub
  });
}

export async function updateCourse(courseId: string, payload: unknown) {
  requireId(courseId, "courseId");
  const body = parseWithSchema(updateCourseSchema, payload);

  const existing = await repo.ensureCourseExists(courseId);
  if (!existing) return null;

  return repo.updateCourse(courseId, {
    ...body,
    ...(body.title ? { slug: await buildUniqueSlug(body.title, courseId) } : {})
  });
}

export async function deleteCourse(courseId: string) {
  requireId(courseId, "courseId");
  const existing = await repo.ensureCourseExists(courseId);
  if (!existing) return null;
  await repo.deleteCourse(courseId);
  return existing;
}

export async function setCoursePublished(courseId: string, isPublished: boolean) {
  requireId(courseId, "courseId");
  const existing = await repo.ensureCourseExists(courseId);
  if (!existing) return null;
  return repo.setCoursePublished(courseId, isPublished);
}

export async function createModule(courseId: string, payload: unknown) {
  requireId(courseId, "courseId");
  const body = parseWithSchema(createModuleSchema, payload);
  const course = await repo.ensureCourseExists(courseId);
  if (!course) return null;
  return repo.createModule({ courseId, ...body });
}

export async function updateModule(moduleId: string, payload: unknown) {
  requireId(moduleId, "moduleId");
  const body = parseWithSchema(updateModuleSchema, payload);
  const existing = await repo.ensureModuleExists(moduleId);
  if (!existing) return null;
  return repo.updateModule(moduleId, body);
}

export async function deleteModule(moduleId: string) {
  requireId(moduleId, "moduleId");
  const existing = await repo.ensureModuleExists(moduleId);
  if (!existing) return null;
  await repo.deleteModule(moduleId);
  return existing;
}

export async function createLesson(moduleId: string, payload: unknown) {
  requireId(moduleId, "moduleId");
  const body = parseWithSchema(createLessonSchema, payload);
  const module = await repo.ensureModuleExists(moduleId);
  if (!module) return null;
  return repo.createLesson({ moduleId, ...body });
}

export async function updateLesson(lessonId: string, payload: unknown) {
  requireId(lessonId, "lessonId");
  const body = parseWithSchema(updateLessonSchema, payload);
  const existing = await repo.ensureLessonExists(lessonId);
  if (!existing) return null;
  return repo.updateLesson(lessonId, body);
}

export async function deleteLesson(lessonId: string) {
  requireId(lessonId, "lessonId");
  const existing = await repo.ensureLessonExists(lessonId);
  if (!existing) return null;
  await repo.deleteLesson(lessonId);
  return existing;
}
