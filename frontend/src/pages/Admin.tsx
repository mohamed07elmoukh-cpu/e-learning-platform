import React, { useEffect, useState } from "react";
import { tokenStorage } from "../auth/tokenStorage";

type ActionState = { type: "success" | "error" | null; message: string | null };
type PublishToggle = "" | "true" | "false";
type LessonType = "VIDEO" | "PDF" | "TEXT" | "LINK" | "QUIZ";

type PublishedCourse = {
  id: string;
  title: string;
  description?: string | null;
  level?: string | null;
  isPublished?: boolean;
};

type CourseResponse = { courses?: PublishedCourse[] } | PublishedCourse[];

const catalogBaseRaw =
  (import.meta as ImportMeta & {
    env?: { VITE_CATALOG_URL?: string; VITE_API_BASE_URL?: string };
  }).env?.VITE_CATALOG_URL ??
  "http://localhost:8082";

const CATALOG_BASE = catalogBaseRaw.replace(/\/$/, "");

function buildCatalogUrl(path: string) {
  return `${CATALOG_BASE}${path}`;
}

async function catalogRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (options.auth !== false) {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      throw new Error("Session expiree. Reconnecte-toi.");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildCatalogUrl(path), {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!res.ok) {
    let message = `Erreur HTTP ${res.status}`;
    try {
      const data = (await res.json()) as { message?: string };
      message = data.message ?? message;
    } catch {
      // Keep default message when response body is empty or invalid.
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

function parseCourses(data: CourseResponse) {
  if (Array.isArray(data)) {
    return data;
  }
  return Array.isArray(data.courses) ? data.courses : [];
}

function parseOptionalInt(value: string) {
  if (value.trim() === "") {
    return undefined;
  }
  return Number(value);
}

function parsePublishToggle(value: PublishToggle) {
  if (value === "") {
    return undefined;
  }
  return value === "true";
}

export default function Admin() {
  const [status, setStatus] = useState<ActionState>({ type: null, message: null });
  const [busy, setBusy] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [publishedCourses, setPublishedCourses] = useState<PublishedCourse[]>([]);

  const [courseCreate, setCourseCreate] = useState({
    title: "",
    description: "",
    level: "",
    thumbnailUrl: ""
  });
  const [courseUpdate, setCourseUpdate] = useState({
    courseId: "",
    title: "",
    description: "",
    level: "",
    thumbnailUrl: ""
  });
  const [courseDeleteId, setCourseDeleteId] = useState("");
  const [coursePublishId, setCoursePublishId] = useState("");
  const [courseUnpublishId, setCourseUnpublishId] = useState("");

  const [moduleCreate, setModuleCreate] = useState({
    courseId: "",
    title: "",
    orderIndex: "",
    isPublished: false
  });
  const [moduleUpdate, setModuleUpdate] = useState({
    moduleId: "",
    title: "",
    orderIndex: "",
    isPublished: "" as PublishToggle
  });
  const [moduleDeleteId, setModuleDeleteId] = useState("");

  const [lessonCreate, setLessonCreate] = useState({
    moduleId: "",
    title: "",
    type: "VIDEO" as LessonType,
    contentUrl: "",
    contentText: "",
    durationMin: "",
    orderIndex: "",
    isPublished: false
  });
  const [lessonUpdate, setLessonUpdate] = useState({
    lessonId: "",
    title: "",
    type: "" as "" | LessonType,
    contentUrl: "",
    contentText: "",
    durationMin: "",
    orderIndex: "",
    isPublished: "" as PublishToggle
  });
  const [lessonDeleteId, setLessonDeleteId] = useState("");

  function setError(message: string) {
    setStatus({ type: "error", message });
  }

  function setSuccess(message: string) {
    setStatus({ type: "success", message });
  }

  async function loadCourses() {
    setLoadingCourses(true);
    try {
      const data = await catalogRequest<CourseResponse>("/catalog/courses", { auth: false });
      setPublishedCourses(parseCourses(data));
    } catch (error) {
      setError((error as Error).message || "Impossible de charger les cours.");
    } finally {
      setLoadingCourses(false);
    }
  }

  async function runAction(
    action: () => Promise<void>,
    successMessage: string,
    options?: { reloadCourses?: boolean; reset?: () => void }
  ) {
    setBusy(true);
    setStatus({ type: null, message: null });
    try {
      await action();
      options?.reset?.();
      setSuccess(successMessage);
      if (options?.reloadCourses) {
        await loadCourses();
      }
    } catch (error) {
      setError((error as Error).message || "Operation echouee.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadCourses();
  }, []);

  return (
    <div className="card" style={{ display: "grid", gap: 24 }}>
      <div>
        <h2 style={{ marginBottom: 8 }}>Administration</h2>
        <p className="muted" style={{ margin: 0 }}>
          Gere les cours, modules et lecons depuis les routes du service catalogue.
        </p>
      </div>

      {status.message ? (
        <div className={`alert${status.type === "success" ? " success" : ""}`}>{status.message}</div>
      ) : null}

      <section style={{ display: "grid", gap: 12 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>Cours disponibles</h3>
          <button
            className="btn soft"
            type="button"
            onClick={() => void loadCourses()}
            disabled={loadingCourses}
          >
            {loadingCourses ? "Chargement..." : "Rafraichir"}
          </button>
        </div>

        {loadingCourses ? (
          <p className="muted" style={{ margin: 0 }}>
            Chargement des cours...
          </p>
        ) : publishedCourses.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Aucun cours trouve.
          </p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {publishedCourses.map((course) => (
              <div
                key={course.id}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: 14,
                  display: "grid",
                  gap: 6
                }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong>{course.title}</strong>
                  <span className="pill">{course.isPublished ? "Publie" : "Brouillon"}</span>
                </div>
                <span className="muted">ID: {course.id}</span>
                {course.level ? <span className="muted">Niveau: {course.level}</span> : null}
                {course.description ? <span className="muted">{course.description}</span> : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="divider" />

      <section style={{ display: "grid", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Cours</h3>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction(
              () =>
                catalogRequest("/catalog/admin/courses", {
                  method: "POST",
                  body: {
                    title: courseCreate.title,
                    description: courseCreate.description || undefined,
                    level: courseCreate.level || undefined,
                    thumbnailUrl: courseCreate.thumbnailUrl || undefined
                  }
                }),
              "Cours cree.",
              {
                reloadCourses: true,
                reset: () =>
                  setCourseCreate({ title: "", description: "", level: "", thumbnailUrl: "" })
              }
            );
          }}
        >
          <h4 style={{ margin: 0 }}>Creer un cours</h4>
          <label>
            Titre
            <input
              value={courseCreate.title}
              onChange={(event) =>
                setCourseCreate((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={courseCreate.description}
              onChange={(event) =>
                setCourseCreate((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>
          <label>
            Niveau
            <input
              value={courseCreate.level}
              onChange={(event) =>
                setCourseCreate((current) => ({ ...current, level: event.target.value }))
              }
            />
          </label>
          <label>
            Thumbnail URL
            <input
              value={courseCreate.thumbnailUrl}
              onChange={(event) =>
                setCourseCreate((current) => ({ ...current, thumbnailUrl: event.target.value }))
              }
            />
          </label>
          <div className="row">
            <button className="btn primary" type="submit" disabled={busy}>
              Creer
            </button>
          </div>
        </form>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction(
              () =>
                catalogRequest(`/catalog/admin/courses/${courseUpdate.courseId}`, {
                  method: "PATCH",
                  body: {
                    title: courseUpdate.title,
                    description: courseUpdate.description || undefined,
                    level: courseUpdate.level || undefined,
                    thumbnailUrl: courseUpdate.thumbnailUrl || undefined
                  }
                }),
              "Cours mis a jour.",
              {
                reloadCourses: true,
                reset: () =>
                  setCourseUpdate({
                    courseId: "",
                    title: "",
                    description: "",
                    level: "",
                    thumbnailUrl: ""
                  })
              }
            );
          }}
        >
          <h4 style={{ margin: 0 }}>Modifier un cours</h4>
          <label>
            Course ID
            <input
              value={courseUpdate.courseId}
              onChange={(event) =>
                setCourseUpdate((current) => ({ ...current, courseId: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Nouveau titre
            <input
              value={courseUpdate.title}
              onChange={(event) =>
                setCourseUpdate((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={courseUpdate.description}
              onChange={(event) =>
                setCourseUpdate((current) => ({ ...current, description: event.target.value }))
              }
            />
          </label>
          <label>
            Niveau
            <input
              value={courseUpdate.level}
              onChange={(event) =>
                setCourseUpdate((current) => ({ ...current, level: event.target.value }))
              }
            />
          </label>
          <label>
            Thumbnail URL
            <input
              value={courseUpdate.thumbnailUrl}
              onChange={(event) =>
                setCourseUpdate((current) => ({ ...current, thumbnailUrl: event.target.value }))
              }
            />
          </label>
          <div className="row">
            <button className="btn primary" type="submit" disabled={busy}>
              Mettre a jour
            </button>
          </div>
        </form>

        <div style={{ display: "grid", gap: 12 }}>
          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
              void runAction(
                () =>
                  catalogRequest(`/catalog/admin/courses/${coursePublishId}/publish`, {
                    method: "POST"
                  }),
                "Cours publie.",
                {
                  reloadCourses: true,
                  reset: () => setCoursePublishId("")
                }
              );
            }}
          >
            <h4 style={{ margin: 0 }}>Publier un cours</h4>
            <label>
              Course ID
              <input
                value={coursePublishId}
                onChange={(event) => setCoursePublishId(event.target.value)}
                required
              />
            </label>
            <div className="row">
              <button className="btn soft" type="submit" disabled={busy}>
                Publier
              </button>
            </div>
          </form>

          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
              void runAction(
                () =>
                  catalogRequest(`/catalog/admin/courses/${courseUnpublishId}/unpublish`, {
                    method: "POST"
                  }),
                "Cours repasse en brouillon.",
                {
                  reloadCourses: true,
                  reset: () => setCourseUnpublishId("")
                }
              );
            }}
          >
            <h4 style={{ margin: 0 }}>Depublier un cours</h4>
            <label>
              Course ID
              <input
                value={courseUnpublishId}
                onChange={(event) => setCourseUnpublishId(event.target.value)}
                required
              />
            </label>
            <div className="row">
              <button className="btn soft" type="submit" disabled={busy}>
                Depublier
              </button>
            </div>
          </form>

          <form
            className="form"
            onSubmit={(event) => {
              event.preventDefault();
              void runAction(
                () =>
                  catalogRequest(`/catalog/admin/courses/${courseDeleteId}`, {
                    method: "DELETE"
                  }),
                "Cours supprime.",
                {
                  reloadCourses: true,
                  reset: () => setCourseDeleteId("")
                }
              );
            }}
          >
            <h4 style={{ margin: 0 }}>Supprimer un cours</h4>
            <label>
              Course ID
              <input
                value={courseDeleteId}
                onChange={(event) => setCourseDeleteId(event.target.value)}
                required
              />
            </label>
            <div className="row">
              <button className="btn outline" type="submit" disabled={busy}>
                Supprimer
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="divider" />

      <section style={{ display: "grid", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Modules</h3>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction(
              () =>
                catalogRequest(`/catalog/admin/courses/${moduleCreate.courseId}/modules`, {
                  method: "POST",
                  body: {
                    title: moduleCreate.title,
                    orderIndex: Number(moduleCreate.orderIndex),
                    isPublished: moduleCreate.isPublished
                  }
                }),
              "Module cree.",
              {
                reset: () =>
                  setModuleCreate({
                    courseId: "",
                    title: "",
                    orderIndex: "",
                    isPublished: false
                  })
              }
            );
          }}
        >
          <h4 style={{ margin: 0 }}>Creer un module</h4>
          <label>
            Course ID
            <input
              value={moduleCreate.courseId}
              onChange={(event) =>
                setModuleCreate((current) => ({ ...current, courseId: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Titre
            <input
              value={moduleCreate.title}
              onChange={(event) =>
                setModuleCreate((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Ordre
            <input
              type="number"
              min="0"
              value={moduleCreate.orderIndex}
              onChange={(event) =>
                setModuleCreate((current) => ({ ...current, orderIndex: event.target.value }))
              }
              required
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={moduleCreate.isPublished}
              onChange={(event) =>
                setModuleCreate((current) => ({ ...current, isPublished: event.target.checked }))
              }
            />
            Publie
          </label>
          <div className="row">
            <button className="btn primary" type="submit" disabled={busy}>
              Creer
            </button>
          </div>
        </form>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            const body: {
              title?: string;
              orderIndex?: number;
              isPublished?: boolean;
            } = {};
            if (moduleUpdate.title.trim()) body.title = moduleUpdate.title;
            const orderIndex = parseOptionalInt(moduleUpdate.orderIndex);
            if (orderIndex !== undefined) body.orderIndex = orderIndex;
            const isPublished = parsePublishToggle(moduleUpdate.isPublished);
            if (isPublished !== undefined) body.isPublished = isPublished;

            void runAction(
              () =>
                catalogRequest(`/catalog/admin/modules/${moduleUpdate.moduleId}`, {
                  method: "PATCH",
                  body
                }),
              "Module mis a jour.",
              {
                reset: () =>
                  setModuleUpdate({
                    moduleId: "",
                    title: "",
                    orderIndex: "",
                    isPublished: ""
                  })
              }
            );
          }}
        >
          <h4 style={{ margin: 0 }}>Modifier un module</h4>
          <label>
            Module ID
            <input
              value={moduleUpdate.moduleId}
              onChange={(event) =>
                setModuleUpdate((current) => ({ ...current, moduleId: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Titre
            <input
              value={moduleUpdate.title}
              onChange={(event) =>
                setModuleUpdate((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label>
            Ordre
            <input
              type="number"
              min="0"
              value={moduleUpdate.orderIndex}
              onChange={(event) =>
                setModuleUpdate((current) => ({ ...current, orderIndex: event.target.value }))
              }
            />
          </label>
          <label>
            Publication
            <select
              value={moduleUpdate.isPublished}
              onChange={(event) =>
                setModuleUpdate((current) => ({
                  ...current,
                  isPublished: event.target.value as PublishToggle
                }))
              }
            >
              <option value="">Ne pas changer</option>
              <option value="true">Publie</option>
              <option value="false">Brouillon</option>
            </select>
          </label>
          <div className="row">
            <button className="btn primary" type="submit" disabled={busy}>
              Mettre a jour
            </button>
          </div>
        </form>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction(
              () =>
                catalogRequest(`/catalog/admin/modules/${moduleDeleteId}`, {
                  method: "DELETE"
                }),
              "Module supprime.",
              {
                reset: () => setModuleDeleteId("")
              }
            );
          }}
        >
          <h4 style={{ margin: 0 }}>Supprimer un module</h4>
          <label>
            Module ID
            <input
              value={moduleDeleteId}
              onChange={(event) => setModuleDeleteId(event.target.value)}
              required
            />
          </label>
          <div className="row">
            <button className="btn outline" type="submit" disabled={busy}>
              Supprimer
            </button>
          </div>
        </form>
      </section>

      <div className="divider" />

      <section style={{ display: "grid", gap: 16 }}>
        <h3 style={{ margin: 0 }}>Lecons</h3>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction(
              () =>
                catalogRequest(`/catalog/admin/modules/${lessonCreate.moduleId}/lessons`, {
                  method: "POST",
                  body: {
                    title: lessonCreate.title,
                    type: lessonCreate.type,
                    contentUrl: lessonCreate.contentUrl || undefined,
                    contentText: lessonCreate.contentText || undefined,
                    durationMin: parseOptionalInt(lessonCreate.durationMin),
                    orderIndex: Number(lessonCreate.orderIndex),
                    isPublished: lessonCreate.isPublished
                  }
                }),
              "Lecon creee.",
              {
                reset: () =>
                  setLessonCreate({
                    moduleId: "",
                    title: "",
                    type: "VIDEO",
                    contentUrl: "",
                    contentText: "",
                    durationMin: "",
                    orderIndex: "",
                    isPublished: false
                  })
              }
            );
          }}
        >
          <h4 style={{ margin: 0 }}>Creer une lecon</h4>
          <label>
            Module ID
            <input
              value={lessonCreate.moduleId}
              onChange={(event) =>
                setLessonCreate((current) => ({ ...current, moduleId: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Titre
            <input
              value={lessonCreate.title}
              onChange={(event) =>
                setLessonCreate((current) => ({ ...current, title: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Type
            <select
              value={lessonCreate.type}
              onChange={(event) =>
                setLessonCreate((current) => ({
                  ...current,
                  type: event.target.value as LessonType
                }))
              }
            >
              <option value="VIDEO">VIDEO</option>
              <option value="PDF">PDF</option>
              <option value="TEXT">TEXT</option>
              <option value="LINK">LINK</option>
              <option value="QUIZ">QUIZ</option>
            </select>
          </label>
          <label>
            Content URL
            <input
              value={lessonCreate.contentUrl}
              onChange={(event) =>
                setLessonCreate((current) => ({ ...current, contentUrl: event.target.value }))
              }
            />
          </label>
          <label>
            Content text
            <textarea
              value={lessonCreate.contentText}
              onChange={(event) =>
                setLessonCreate((current) => ({ ...current, contentText: event.target.value }))
              }
            />
          </label>
          <label>
            Duree (minutes)
            <input
              type="number"
              min="0"
              value={lessonCreate.durationMin}
              onChange={(event) =>
                setLessonCreate((current) => ({ ...current, durationMin: event.target.value }))
              }
            />
          </label>
          <label>
            Ordre
            <input
              type="number"
              min="0"
              value={lessonCreate.orderIndex}
              onChange={(event) =>
                setLessonCreate((current) => ({ ...current, orderIndex: event.target.value }))
              }
              required
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={lessonCreate.isPublished}
              onChange={(event) =>
                setLessonCreate((current) => ({ ...current, isPublished: event.target.checked }))
              }
            />
            Publie
          </label>
          <div className="row">
            <button className="btn primary" type="submit" disabled={busy}>
              Creer
            </button>
          </div>
        </form>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            const body: {
              title?: string;
              type?: LessonType;
              contentUrl?: string;
              contentText?: string;
              durationMin?: number;
              orderIndex?: number;
              isPublished?: boolean;
            } = {};

            if (lessonUpdate.title.trim()) body.title = lessonUpdate.title;
            if (lessonUpdate.type) body.type = lessonUpdate.type;
            if (lessonUpdate.contentUrl.trim()) body.contentUrl = lessonUpdate.contentUrl;
            if (lessonUpdate.contentText.trim()) body.contentText = lessonUpdate.contentText;
            const durationMin = parseOptionalInt(lessonUpdate.durationMin);
            if (durationMin !== undefined) body.durationMin = durationMin;
            const orderIndex = parseOptionalInt(lessonUpdate.orderIndex);
            if (orderIndex !== undefined) body.orderIndex = orderIndex;
            const isPublished = parsePublishToggle(lessonUpdate.isPublished);
            if (isPublished !== undefined) body.isPublished = isPublished;

            void runAction(
              () =>
                catalogRequest(`/catalog/admin/lessons/${lessonUpdate.lessonId}`, {
                  method: "PATCH",
                  body
                }),
              "Lecon mise a jour.",
              {
                reset: () =>
                  setLessonUpdate({
                    lessonId: "",
                    title: "",
                    type: "",
                    contentUrl: "",
                    contentText: "",
                    durationMin: "",
                    orderIndex: "",
                    isPublished: ""
                  })
              }
            );
          }}
        >
          <h4 style={{ margin: 0 }}>Modifier une lecon</h4>
          <label>
            Lesson ID
            <input
              value={lessonUpdate.lessonId}
              onChange={(event) =>
                setLessonUpdate((current) => ({ ...current, lessonId: event.target.value }))
              }
              required
            />
          </label>
          <label>
            Titre
            <input
              value={lessonUpdate.title}
              onChange={(event) =>
                setLessonUpdate((current) => ({ ...current, title: event.target.value }))
              }
            />
          </label>
          <label>
            Type
            <select
              value={lessonUpdate.type}
              onChange={(event) =>
                setLessonUpdate((current) => ({
                  ...current,
                  type: event.target.value as "" | LessonType
                }))
              }
            >
              <option value="">Ne pas changer</option>
              <option value="VIDEO">VIDEO</option>
              <option value="PDF">PDF</option>
              <option value="TEXT">TEXT</option>
              <option value="LINK">LINK</option>
              <option value="QUIZ">QUIZ</option>
            </select>
          </label>
          <label>
            Content URL
            <input
              value={lessonUpdate.contentUrl}
              onChange={(event) =>
                setLessonUpdate((current) => ({ ...current, contentUrl: event.target.value }))
              }
            />
          </label>
          <label>
            Content text
            <textarea
              value={lessonUpdate.contentText}
              onChange={(event) =>
                setLessonUpdate((current) => ({ ...current, contentText: event.target.value }))
              }
            />
          </label>
          <label>
            Duree (minutes)
            <input
              type="number"
              min="0"
              value={lessonUpdate.durationMin}
              onChange={(event) =>
                setLessonUpdate((current) => ({ ...current, durationMin: event.target.value }))
              }
            />
          </label>
          <label>
            Ordre
            <input
              type="number"
              min="0"
              value={lessonUpdate.orderIndex}
              onChange={(event) =>
                setLessonUpdate((current) => ({ ...current, orderIndex: event.target.value }))
              }
            />
          </label>
          <label>
            Publication
            <select
              value={lessonUpdate.isPublished}
              onChange={(event) =>
                setLessonUpdate((current) => ({
                  ...current,
                  isPublished: event.target.value as PublishToggle
                }))
              }
            >
              <option value="">Ne pas changer</option>
              <option value="true">Publie</option>
              <option value="false">Brouillon</option>
            </select>
          </label>
          <div className="row">
            <button className="btn primary" type="submit" disabled={busy}>
              Mettre a jour
            </button>
          </div>
        </form>

        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            void runAction(
              () =>
                catalogRequest(`/catalog/admin/lessons/${lessonDeleteId}`, {
                  method: "DELETE"
                }),
              "Lecon supprimee.",
              {
                reset: () => setLessonDeleteId("")
              }
            );
          }}
        >
          <h4 style={{ margin: 0 }}>Supprimer une lecon</h4>
          <label>
            Lesson ID
            <input
              value={lessonDeleteId}
              onChange={(event) => setLessonDeleteId(event.target.value)}
              required
            />
          </label>
          <div className="row">
            <button className="btn outline" type="submit" disabled={busy}>
              Supprimer
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
