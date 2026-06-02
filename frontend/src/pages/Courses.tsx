import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import { Course } from "../api/types";

type CourseListResponse =
  | Course[]
  | {
      courses?: Course[];
      items?: Course[];
    };

function getCourseAccent(index: number) {
  const accents = ["orange", "blue", "ink"];
  return accents[index % accents.length];
}

export default function Courses() {
  const [items, setItems] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await http.get<CourseListResponse>(endpoints.courses.list, true);
        const courses = Array.isArray(data) ? data : (data.items ?? data.courses ?? []);
        setItems(courses);
      } catch (err: any) {
        setError(err?.message ?? "Erreur chargement cours");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featuredCount = useMemo(() => items.filter((course) => course.featured).length, [items]);

  if (loading) return <div className="card">Chargement des cours...</div>;
  if (error) return <div className="card"><div className="alert">{error}</div></div>;

  return (
    <div className="courses-page">
      <section className="courses-hero card">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1>Des cours mieux presentes et plus simples a parcourir.</h1>
          <p className="muted">
            Categories, durees, niveaux et tags sont maintenant visibles directement dans le
            catalogue.
          </p>
        </div>
        <div className="courses-hero-stats">
          <div>
            <strong>{items.length}</strong>
            <span>cours publies</span>
          </div>
          <div>
            <strong>{featuredCount}</strong>
            <span>mis en avant</span>
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <div className="card">
          <p className="muted">Aucun cours disponible.</p>
        </div>
      ) : (
        <section className="course-grid">
          {items.map((course, index) => (
            <article
              key={course.id}
              className={`course-card course-card-${getCourseAccent(index)}`}
            >
              <div className="course-card-top">
                <span className="mini-chip">{course.category ?? "General"}</span>
                <span className="course-level">{course.level ?? "All levels"}</span>
              </div>

              <div className="course-card-body">
                <h3>{course.title}</h3>
                <p>{course.shortDescription ?? course.description ?? "Cours disponible."}</p>
              </div>

              {course.tags && course.tags.length > 0 ? (
                <div className="tag-row">
                  {course.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="course-meta-grid">
                <div>
                  <strong>{course.estimatedHours ?? 0}h</strong>
                  <span>charge estimee</span>
                </div>
                <div>
                  <strong>{course.featured ? "Top" : "Live"}</strong>
                  <span>{course.featured ? "selection equipe" : "publie"}</span>
                </div>
              </div>

              <div className="row">
                <Link className="btn primary" to={`/courses/${course.id}`}>
                  Voir le detail
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
