import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import { Course } from "../api/types";

export default function Courses() {
  const [items, setItems] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Option A: API returns { courses: Course[] }
        // Option B: API returns Course[]
        const data = await http.get<any>(endpoints.courses.list, true);
        const courses = Array.isArray(data) ? data : (data.courses ?? []);
        setItems(courses);
      } catch (err: any) {
        setError(err?.message ?? "Erreur chargement cours");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="card">Chargement des cours...</div>;
  if (error) return <div className="card"><div className="alert">{error}</div></div>;

  return (
    <div className="card">
      <h2>Cours</h2>

      {items.length === 0 ? (
        <p className="muted">Aucun cours disponible.</p>
      ) : (
        <ul className="list">
          {items.map((c) => (
            <li key={c.id} className="list-item">
              <div>
                <div className="title">{c.title}</div>
                {c.description && <div className="muted">{c.description}</div>}
              </div>
              <Link className="btn ghost" to={`/courses/${c.id}`}>Détails</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

