import prisma from "../../db/prisma";

export type PaginationParams = {
  page: number;
  pageSize: number;
};

export async function listPublishedCourses(params: PaginationParams) {
  const { page, pageSize } = params;
  const skip = (page - 1) * pageSize;

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize
    }),
    prisma.course.count({ where: { isPublished: true } })
  ]);

  return { items, total };
}

export async function getPublishedCourseById(courseId: string) {
  return prisma.course.findFirst({
    where: { id: courseId, isPublished: true },
    include: {
      modules: {
        where: { isPublished: true },
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { orderIndex: "asc" }
          }
        }
      }
    }
  });
}
