import prisma from "../db/prisma";

export async function seedDefaultCatalog() {
  const publishedCount = await prisma.course.count({
    where: { isPublished: true }
  });

  if (publishedCount > 0) {
    return;
  }

  await prisma.course.createMany({
    data: [
      {
        title: "React pour debutants",
        slug: "react-pour-debutants",
        shortDescription: "Apprenez React a travers un parcours concret et progressif.",
        description: "Bases de React, composants, props, state et navigation.",
        level: "Beginner",
        category: "Frontend",
        estimatedHours: 12,
        thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
        tags: ["React", "Frontend", "UI"],
        featured: true,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: "system_seed"
      },
      {
        title: "TypeScript pratique",
        slug: "typescript-pratique",
        shortDescription: "Un cours axe production pour typer proprement vos apps.",
        description: "Typage solide pour applications frontend et backend Node.js.",
        level: "Intermediate",
        category: "Programming",
        estimatedHours: 9,
        thumbnailUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
        tags: ["TypeScript", "Node.js", "Quality"],
        isPublished: true,
        publishedAt: new Date(),
        createdBy: "system_seed"
      },
      {
        title: "API REST avec Node.js",
        slug: "api-rest-nodejs",
        shortDescription: "Architecture backend moderne, auth, middleware et patterns clairs.",
        description: "Construire une API Express avec auth, validation et architecture propre.",
        level: "Advanced",
        category: "Backend",
        estimatedHours: 15,
        thumbnailUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1200&q=80",
        tags: ["API", "Express", "JWT"],
        featured: true,
        isPublished: true,
        publishedAt: new Date(),
        createdBy: "system_seed"
      }
    ]
  });

  const courses = await prisma.course.findMany({
    where: { createdBy: "system_seed" },
    orderBy: { createdAt: "asc" }
  });

  const [reactCourse, tsCourse, apiCourse] = courses;
  if (!reactCourse || !tsCourse || !apiCourse) {
    return;
  }

  await prisma.module.createMany({
    data: [
      {
        courseId: reactCourse.id,
        title: "Introduction a React",
        summary: "JSX, composants et structure d'une application simple.",
        orderIndex: 1,
        isPublished: true
      },
      {
        courseId: reactCourse.id,
        title: "Etat et effets",
        summary: "Gerer des interfaces dynamiques avec les hooks essentiels.",
        orderIndex: 2,
        isPublished: true
      },
      {
        courseId: tsCourse.id,
        title: "Types de base",
        summary: "Comprendre le systeme de types et les annotations utiles.",
        orderIndex: 1,
        isPublished: true
      },
      {
        courseId: tsCourse.id,
        title: "Interfaces et generiques",
        summary: "Concevoir des contrats robustes et reutilisables.",
        orderIndex: 2,
        isPublished: true
      },
      {
        courseId: apiCourse.id,
        title: "Architecture Express",
        summary: "Structurer routes, services et acces donnees proprement.",
        orderIndex: 1,
        isPublished: true
      },
      {
        courseId: apiCourse.id,
        title: "Auth et middleware",
        summary: "Securiser les endpoints et organiser les responsabilites.",
        orderIndex: 2,
        isPublished: true
      }
    ]
  });

  const modules = await prisma.module.findMany({
    where: {
      courseId: { in: [reactCourse.id, tsCourse.id, apiCourse.id] }
    },
    orderBy: [{ courseId: "asc" }, { orderIndex: "asc" }]
  });

  const moduleByKey = new Map(modules.map((module) => [`${module.courseId}:${module.orderIndex}`, module]));

  await prisma.lesson.createMany({
    data: [
      {
        moduleId: moduleByKey.get(`${reactCourse.id}:1`)!.id,
        title: "Creer son premier composant",
        type: "VIDEO",
        contentUrl: "https://example.com/react-component",
        durationMin: 18,
        orderIndex: 1,
        isPreview: true,
        isPublished: true
      },
      {
        moduleId: moduleByKey.get(`${reactCourse.id}:2`)!.id,
        title: "useState et useEffect",
        type: "VIDEO",
        contentUrl: "https://example.com/react-hooks",
        durationMin: 24,
        orderIndex: 1,
        isPublished: true
      },
      {
        moduleId: moduleByKey.get(`${tsCourse.id}:1`)!.id,
        title: "Bien typer ses variables",
        type: "TEXT",
        contentText: "Comprendre string, number, boolean, array et union types.",
        durationMin: 12,
        orderIndex: 1,
        isPreview: true,
        isPublished: true
      },
      {
        moduleId: moduleByKey.get(`${tsCourse.id}:2`)!.id,
        title: "Generiques utiles au quotidien",
        type: "TEXT",
        contentText: "Utiliser les generiques pour mieux typer les fonctions et reponses API.",
        durationMin: 16,
        orderIndex: 1,
        isPublished: true
      },
      {
        moduleId: moduleByKey.get(`${apiCourse.id}:1`)!.id,
        title: "Decouper routes, services et repository",
        type: "VIDEO",
        contentUrl: "https://example.com/express-architecture",
        durationMin: 21,
        orderIndex: 1,
        isPreview: true,
        isPublished: true
      },
      {
        moduleId: moduleByKey.get(`${apiCourse.id}:2`)!.id,
        title: "JWT, guards et roles",
        type: "VIDEO",
        contentUrl: "https://example.com/jwt-roles",
        durationMin: 26,
        orderIndex: 1,
        isPublished: true
      }
    ]
  });

  console.log("Seeded default catalog courses");
}
