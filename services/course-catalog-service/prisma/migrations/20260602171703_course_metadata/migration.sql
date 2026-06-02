-- Add richer metadata to courses, modules and lessons
ALTER TABLE "Course"
ADD COLUMN "slug" TEXT,
ADD COLUMN "shortDescription" TEXT,
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'Development',
ADD COLUMN "estimatedHours" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "publishedAt" TIMESTAMP(3);

ALTER TABLE "Module"
ADD COLUMN "summary" TEXT;

ALTER TABLE "Lesson"
ADD COLUMN "isPreview" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Course"
SET
  "slug" = regexp_replace(
    trim(both '-' from regexp_replace(lower("title"), '[^a-z0-9]+', '-', 'g')),
    '-{2,}',
    '-',
    'g'
  ),
  "shortDescription" = COALESCE("description", "title"),
  "category" = CASE
    WHEN lower("title") LIKE '%react%' THEN 'Frontend'
    WHEN lower("title") LIKE '%typescript%' THEN 'Programming'
    WHEN lower("title") LIKE '%api%' OR lower("title") LIKE '%node%' THEN 'Backend'
    ELSE 'Development'
  END,
  "estimatedHours" = CASE
    WHEN lower("title") LIKE '%react%' THEN 12
    WHEN lower("title") LIKE '%typescript%' THEN 9
    WHEN lower("title") LIKE '%api%' OR lower("title") LIKE '%node%' THEN 15
    ELSE 6
  END,
  "tags" = CASE
    WHEN lower("title") LIKE '%react%' THEN ARRAY['React', 'Frontend', 'UI']
    WHEN lower("title") LIKE '%typescript%' THEN ARRAY['TypeScript', 'Node.js', 'Quality']
    WHEN lower("title") LIKE '%api%' OR lower("title") LIKE '%node%' THEN ARRAY['API', 'Express', 'JWT']
    ELSE ARRAY['Learning']
  END,
  "featured" = CASE
    WHEN lower("title") LIKE '%react%' OR lower("title") LIKE '%api%' OR lower("title") LIKE '%node%' THEN true
    ELSE false
  END,
  "publishedAt" = CASE WHEN "isPublished" THEN COALESCE("publishedAt", "createdAt") ELSE NULL END;

UPDATE "Module"
SET "summary" = concat('Focus sur ', lower("title"), '.')
WHERE "summary" IS NULL;

UPDATE "Lesson"
SET "isPreview" = ("orderIndex" = 1)
WHERE "isPreview" = false;

ALTER TABLE "Course"
ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");
CREATE INDEX "Course_isPublished_featured_createdAt_idx" ON "Course"("isPublished", "featured", "createdAt" DESC);
CREATE INDEX "Course_category_isPublished_idx" ON "Course"("category", "isPublished");
