import { getPublishedCourseById, listPublishedCourses } from "./catalog.repo";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function normalizePage(value: unknown) {
  const page = Number(value);
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.floor(page);
}

function normalizePageSize(value: unknown) {
  const size = Number(value);
  if (!Number.isFinite(size) || size < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.floor(size), MAX_PAGE_SIZE);
}

export async function listCatalogCourses(query: { page?: unknown; pageSize?: unknown }) {
  const page = normalizePage(query.page);
  const pageSize = normalizePageSize(query.pageSize);

  const { items, total } = await listPublishedCourses({ page, pageSize });
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

  return {
    items,
    page,
    pageSize,
    total,
    totalPages
  };
}

export async function getCatalogCourse(courseId: string) {
  return getPublishedCourseById(courseId);
}
