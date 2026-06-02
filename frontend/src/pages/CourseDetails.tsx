import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import { CourseDetail } from "../api/types";

function sumLessonDuration(course: CourseDetail) {
  return course.modules.reduce(
    (total, module) =>
      total +
      module.lessons.reduce((moduleTotal, lesson) => moduleTotal + (lesson.durationMin ?? 0), 0),
    0
  );
}

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const data = await http.get<{ course: CourseDetail } | CourseDetail>(
          endpoints.courses.details(id),
          true
        );
        const nextCourse = ("course" in data ? data.course : data) as CourseDetail;
        setCourse(nextCourse);
      } catch (err: any) {
        setError(err?.message ?? "Erreur chargement cours");
      }
    })();
  }, [id]);

  const moduleCount = useMemo(() => course?.modules.length ?? 0, [course]);
  const lessonCount = useMemo(
    () => course?.modules.reduce((total, module) => total + module.lessons.length, 0) ?? 0,
    [course]
  );
  const duration = useMemo(() => (course ? sumLessonDuration(course) : 0), [course]);

  if (error) return <div className="card"><div className="alert">{error}</div></div>;
  if (!course) return <div className="card">Chargement...</div>;

  return (
    <div className="course-detail-page">
      <section className="course-detail-hero card">
        <div className="course-detail-copy">
          <div className="row">
            <span className="mini-chip">{course.category ?? "General"}</span>
            <span className="course-level">{course.level ?? "All levels"}</span>
          </div>
          <h1>{course.title}</h1>
          <p className="muted">
            {course.description ?? course.shortDescription ?? "Pas de description."}
          </p>
          {course.tags && course.tags.length > 0 ? (
            <div className="tag-row">
              {course.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="row">
            <Link className="btn outline" to="/courses">
              Retour au catalogue
            </Link>
          </div>
        </div>

        <div className="course-detail-stats">
          <div className="detail-stat-card">
            <strong>{moduleCount}</strong>
            <span>modules</span>
          </div>
          <div className="detail-stat-card">
            <strong>{lessonCount}</strong>
            <span>lecons</span>
          </div>
          <div className="detail-stat-card">
            <strong>{duration} min</strong>
            <span>contenu visible</span>
          </div>
          <div className="detail-stat-card">
            <strong>{course.estimatedHours ?? 0}h</strong>
            <span>charge estimee</span>
          </div>
        </div>
      </section>

      <section className="module-stack">
        {course.modules.length === 0 ? (
          <div className="card">
            <p className="muted">Aucun module publie pour ce cours.</p>
          </div>
        ) : (
          course.modules.map((module) => (
            <article key={module.id} className="module-card">
              <div className="module-card-head">
                <div>
                  <span className="module-order">Module {module.orderIndex}</span>
                  <h3>{module.title}</h3>
                  {module.summary ? <p>{module.summary}</p> : null}
                </div>
                <span className="mini-chip">{module.lessons.length} lecons</span>
              </div>

              <div className="lesson-list">
                {module.lessons.map((lesson) => (
                  <div key={lesson.id} className="lesson-row">
                    <div>
                      <strong>{lesson.title}</strong>
                      <p>
                        {lesson.type}
                        {lesson.durationMin ? ` • ${lesson.durationMin} min` : ""}
                        {lesson.isPreview ? " • apercu" : ""}
                      </p>
                    </div>
                    <span className="lesson-type-pill">{lesson.type}</span>
                  </div>
                ))}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
