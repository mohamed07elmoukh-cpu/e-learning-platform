
import { JwtUser } from "../../middleware/auth.middleware";
import * as repo from "./admin.repo";

type AnyObject = Record<string, unknown>;

type HttpError = Error & { status?: number; details?: string };

const LESSON_TYPES = new Set(["VIDEO", "PDF", "TEXT", "LINK", "QUIZ"]);

function badRequest(message: string, details?: string): never {
  const error = new Error(message) as HttpError;
  error.status = 400;
  error.details = details;
  throw error;
}

function ensureObject(payload: unknown): AnyObject {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    badRequest("Invalid payload");
  }
  return payload as AnyObject;
}

function hasKey(obj: AnyObject, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function ensureAllowedKeys(obj: AnyObject, allowed: string[]) {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) {
      badRequest("Unknown field", key);
    }
  }
}

function ensureHasFields(obj: AnyObject, allowed: string[]) {
  const hasAny = allowed.some((key) => hasKey(obj, key));
  if (!hasAny) {
    badRequest("No fields to update");
  }
}

function parseRequiredString(obj: AnyObject, key: string) {
  const value = obj[key];
  if (typeof value !== "string" || value.trim() === "") {
    badRequest(`${key} is required`);
  }
  return value.trim();
}

function parseOptionalString(obj: AnyObject, key: string) {
  if (!hasKey(obj, key)) return undefined;
  const value = obj[key];
  if (value === null) return null;
  if (typeof value !== "string") {
    badRequest(`${key} must be a string`);
  }
  return value.trim();
}

function parseRequiredInt(obj: AnyObject, key: string) {
  const value = obj[key];
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) {
    badRequest(`${key} must be a non-negative integer`);
  }
  return num;
}

function parseOptionalInt(obj: AnyObject, key: string) {
  if (!hasKey(obj, key)) return undefined;
  const value = obj[key];
  if (value === null) return null;
  const num = Number(value);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 0) {
    badRequest(`${key} must be a non-negative integer`);
  }
  return num;
}

function parseOptionalBoolean(obj: AnyObject, key: string) {
  if (!hasKey(obj, key)) return undefined;
  const value = obj[key];
  if (typeof value !== "boolean") {
    badRequest(`${key} must be a boolean`);
  }
  return value;
}

function parseLessonType(obj: AnyObject, key: string) {
  const value = obj[key];
  if (typeof value !== "string" || !LESSON_TYPES.has(value)) {
    badRequest(`${key} is invalid`);
  }
  return value as "VIDEO" | "PDF" | "TEXT" | "LINK" | "QUIZ";
}

function requireId(value: string | undefined, name: string) {
  if (!value) {
    badRequest(`${name} is required`);
  }
}

export async function createCourse(payload: unknown, user: JwtUser) {
  const body = ensureObject(payload);
  ensureAllowedKeys(body, ["title", "description", "level", "thumbnailUrl"]);
  const title = parseRequiredString(body, "title");
  const description = parseOptionalString(body, "description");
  const level = parseOptionalString(body, "level");
  const thumbnailUrl = parseOptionalString(body, "thumbnailUrl");
  return repo.createCourse({ title, description, level, thumbnailUrl, createdBy: user.sub });
}

export async function updateCourse(courseId: string, payload: unknown) {
  requireId(courseId, "courseId");
  const body = ensureObject(payload);
  const allowed = ["title", "description", "level", "thumbnailUrl"];
  ensureAllowedKeys(body, allowed);
  ensureHasFields(body, allowed);
  const data: { title?: string; description?: string | null; level?: string | null; thumbnailUrl?: string | null } = {};
  if (hasKey(body, "title")) {
    data.title = parseRequiredString(body, "title");
  }
  if (hasKey(body, "description")) {
    data.description = parseOptionalString(body, "description");
  }
  if (hasKey(body, "level")) {
    data.level = parseOptionalString(body, "level");
  }
  if (hasKey(body, "thumbnailUrl")) {
    data.thumbnailUrl = parseOptionalString(body, "thumbnailUrl");
  }
  const existing = await repo.ensureCourseExists(courseId);
  if (!existing) return null;
  return repo.updateCourse(courseId, data);
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
  const body = ensureObject(payload);
  const allowed = ["title", "orderIndex", "isPublished"];
  ensureAllowedKeys(body, allowed);
  const title = parseRequiredString(body, "title");
  const orderIndex = parseRequiredInt(body, "orderIndex");
  const isPublished = parseOptionalBoolean(body, "isPublished");
  const course = await repo.ensureCourseExists(courseId);
  if (!course) return null;
  return repo.createModule({ courseId, title, orderIndex, isPublished });
}

export async function updateModule(moduleId: string, payload: unknown) {
  requireId(moduleId, "moduleId");
  const body = ensureObject(payload);
  const allowed = ["title", "orderIndex", "isPublished"];
  ensureAllowedKeys(body, allowed);
  ensureHasFields(body, allowed);
  const data: { title?: string; orderIndex?: number; isPublished?: boolean } = {};
  if (hasKey(body, "title")) {
    data.title = parseRequiredString(body, "title");
  }
  if (hasKey(body, "orderIndex")) {
    data.orderIndex = parseRequiredInt(body, "orderIndex");
  }
  if (hasKey(body, "isPublished")) {
    data.isPublished = parseOptionalBoolean(body, "isPublished");
  }
  const existing = await repo.ensureModuleExists(moduleId);
  if (!existing) return null;
  return repo.updateModule(moduleId, data);
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
  const body = ensureObject(payload);
  const allowed = ["title", "type", "contentUrl", "contentText", "durationMin", "orderIndex", "isPublished"];
  ensureAllowedKeys(body, allowed);
  const title = parseRequiredString(body, "title");
  const type = parseLessonType(body, "type");
  const contentUrl = parseOptionalString(body, "contentUrl");
  const contentText = parseOptionalString(body, "contentText");
  const durationMin = parseOptionalInt(body, "durationMin");
  const orderIndex = parseRequiredInt(body, "orderIndex");
  const isPublished = parseOptionalBoolean(body, "isPublished");
  const module = await repo.ensureModuleExists(moduleId);
  if (!module) return null;
  return repo.createLesson({ moduleId, title, type, contentUrl, contentText, durationMin, orderIndex, isPublished });
}

export async function updateLesson(lessonId: string, payload: unknown) {
  requireId(lessonId, "lessonId");
  const body = ensureObject(payload);
  const allowed = ["title", "type", "contentUrl", "contentText", "durationMin", "orderIndex", "isPublished"];
  ensureAllowedKeys(body, allowed);
  ensureHasFields(body, allowed);
  const data: {
    title?: string;
    type?: "VIDEO" | "PDF" | "TEXT" | "LINK" | "QUIZ";
    contentUrl?: string | null;
    contentText?: string | null;
    durationMin?: number | null;
    orderIndex?: number;
    isPublished?: boolean;
  } = {};
  if (hasKey(body, "title")) {
    data.title = parseRequiredString(body, "title");
  }
  if (hasKey(body, "type")) {
    data.type = parseLessonType(body, "type");
  }
  if (hasKey(body, "contentUrl")) {
    data.contentUrl = parseOptionalString(body, "contentUrl");
  }
  if (hasKey(body, "contentText")) {
    data.contentText = parseOptionalString(body, "contentText");
  }
  if (hasKey(body, "durationMin")) {
    data.durationMin = parseOptionalInt(body, "durationMin");
  }
  if (hasKey(body, "orderIndex")) {
    data.orderIndex = parseRequiredInt(body, "orderIndex");
  }
  if (hasKey(body, "isPublished")) {
    data.isPublished = parseOptionalBoolean(body, "isPublished");
  }
  const existing = await repo.ensureLessonExists(lessonId);
  if (!existing) return null;
  return repo.updateLesson(lessonId, data);
}

export async function deleteLesson(lessonId: string) {
  requireId(lessonId, "lessonId");
  const existing = await repo.ensureLessonExists(lessonId);
  if (!existing) return null;
  await repo.deleteLesson(lessonId);
  return existing;
}

