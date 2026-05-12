import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import { Course } from "../api/types";

export default function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        if (!id) return;
        const data = await http.get<any>(endpoints.courses.details(id), true);
        const c = (data.course ?? data) as Course;
        setCourse(c);
      } catch (err: any) {
        setError(err?.message ?? "Erreur chargement cours");
      }
    })();
  }, [id]);

  if (error) return <div className="card"><div className="alert">{error}</div></div>;
  if (!course) return <div className="card">Chargement...</div>;

  return (
    <div className="card">
      <div className="row space">
        <h2>{course.title}</h2>
        <Link className="btn ghost" to="/courses">Retour</Link>
      </div>
      <p className="muted">{course.description ?? "Pas de description."}</p>

      <div className="divider" />

      <h3>Contenu (placeholder)</h3>
      <ul className="muted">
        <li>Chapitre 1</li>
        <li>Chapitre 2</li>
        <li>Quiz</li>
      </ul>
    </div>
  );
}

