import { z } from "zod";

const nullableString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  });

const requiredString = z.string().trim().min(1);
const optionalString = z.string().trim().min(1).optional();

const stringArray = z
  .array(z.string().trim().min(1))
  .optional()
  .transform((value) => value?.map((item) => item.trim()).filter(Boolean));

const nonNegativeInt = z.number().int().min(0);
const coercibleNonNegativeInt = z.coerce.number().int().min(0);

const publicationFlag = z.boolean().optional();

export const createCourseSchema = z.object({
  title: requiredString,
  shortDescription: nullableString,
  description: nullableString,
  level: nullableString,
  category: optionalString,
  estimatedHours: coercibleNonNegativeInt.optional(),
  thumbnailUrl: nullableString,
  tags: stringArray,
  featured: publicationFlag
});

export const updateCourseSchema = createCourseSchema
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, { message: "No fields to update" });

export const createModuleSchema = z.object({
  title: requiredString,
  summary: nullableString,
  orderIndex: coercibleNonNegativeInt,
  isPublished: publicationFlag
});

export const updateModuleSchema = z
  .object({
    title: requiredString.optional(),
    summary: nullableString,
    orderIndex: coercibleNonNegativeInt.optional(),
    isPublished: publicationFlag
  })
  .refine((payload) => Object.keys(payload).length > 0, { message: "No fields to update" });

export const lessonTypeSchema = z.enum(["VIDEO", "PDF", "TEXT", "LINK", "QUIZ"]);

export const createLessonSchema = z.object({
  title: requiredString,
  type: lessonTypeSchema,
  contentUrl: nullableString,
  contentText: nullableString,
  durationMin: coercibleNonNegativeInt.optional().nullable(),
  orderIndex: coercibleNonNegativeInt,
  isPreview: publicationFlag,
  isPublished: publicationFlag
});

export const updateLessonSchema = z
  .object({
    title: requiredString.optional(),
    type: lessonTypeSchema.optional(),
    contentUrl: nullableString,
    contentText: nullableString,
    durationMin: coercibleNonNegativeInt.optional().nullable(),
    orderIndex: coercibleNonNegativeInt.optional(),
    isPreview: publicationFlag,
    isPublished: publicationFlag
  })
  .refine((payload) => Object.keys(payload).length > 0, { message: "No fields to update" });

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
