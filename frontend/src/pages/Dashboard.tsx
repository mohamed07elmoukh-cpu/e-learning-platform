import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { tokenStorage } from "../auth/tokenStorage";
import { decodeJwtPayload } from "../utils/jwt";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";
import { Course } from "../api/types";

type JwtPayload = {
  exp?: number;
};

type CourseListResponse =
  | Course[]
  | {
      courses?: Course[];
      items?: Course[];
    };

function formatRemaining(ms: number) {
  if (ms <= 0) return "Expiree";
  const totalMinutes = Math.ceil(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.fullName ?? user?.email ?? "Utilisateur";
  const accessToken = tokenStorage.getAccessToken();
  const payload = useMemo(
    () => (accessToken ? decodeJwtPayload<JwtPayload>(accessToken) : null),
    [accessToken]
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await http.get<CourseListResponse>(endpoints.courses.list, true);
        const items = Array.isArray(data) ? data : (data.items ?? data.courses ?? []);
        setCourses(items);
      } catch {
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, []);

  const featuredCount = courses.filter((course) => course.featured).length;
  const categories = new Set(courses.map((course) => course.category).filter(Boolean)).size;
  const highlightedCourses = courses.slice(0, 3);
  const remainingMs = payload?.exp ? payload.exp * 1000 - Date.now() : null;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero card">
        <div className="dashboard-copy">
          <p className="eyebrow">Dashboard</p>
          <h1>Bienvenue, {displayName}.</h1>
          <p className="muted">
            Voici une vue plus utile de votre espace avec la session, le catalogue et les actions
            rapides selon votre role.
          </p>

          <div className="dashboard-role-line">
            <span className="mini-chip">Role</span>
            <span className="course-level">{user?.role ?? "STUDENT"}</span>
          </div>

          <div className="hero-actions">
            <Link className="btn primary" to="/courses">
              Explorer les cours
            </Link>
            <Link className="btn ghost" to="/profile">
              Gerer mon profil
            </Link>
            {user?.role === "ADMIN" ? (
              <Link className="btn outline" to="/admin">
                Ouvrir l admin
              </Link>
            ) : null}
            {user?.role === "INSTRUCTOR" || user?.role === "ADMIN" ? (
              <Link className="btn outline" to="/instructor">
                Espace formateur
              </Link>
            ) : null}
          </div>
        </div>

        <div className="dashboard-stat-grid">
          <div className="detail-stat-card">
            <strong>{loadingCourses ? "..." : courses.length}</strong>
            <span>cours publies</span>
          </div>
          <div className="detail-stat-card">
            <strong>{loadingCourses ? "..." : featuredCount}</strong>
            <span>cours mis en avant</span>
          </div>
          <div className="detail-stat-card">
            <strong>{loadingCourses ? "..." : categories}</strong>
            <span>categories actives</span>
          </div>
          <div className="detail-stat-card">
            <strong>{remainingMs !== null ? formatRemaining(remainingMs) : "N/A"}</strong>
            <span>session restante</span>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <div className="dashboard-card-head">
            <h3>Profil rapide</h3>
            <span className="mini-chip">Compte</span>
          </div>
          <div className="dashboard-kv">
            <div>
              <span>Nom</span>
              <strong>{user?.fullName ?? "Non renseigne"}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{user?.email ?? "Non renseigne"}</strong>
            </div>
            <div>
              <span>Telephone</span>
              <strong>{user?.phone ?? "Aucun numero"}</strong>
            </div>
            <div>
              <span>Age</span>
              <strong>{user?.age ?? "Non renseigne"}</strong>
            </div>
          </div>
        </article>

        <article className="dashboard-card">
          <div className="dashboard-card-head">
            <h3>Actions recommandees</h3>
            <span className="mini-chip">Prochaines etapes</span>
          </div>
          <div className="dashboard-action-list">
            <Link className="dashboard-action" to="/courses">
              <strong>Continuer le catalogue</strong>
              <span>Consultez les nouveaux cours publies et leur detail.</span>
            </Link>
            <Link className="dashboard-action" to="/profile">
              <strong>Completer votre profil</strong>
              <span>Ajoutez vos informations personnelles pour une fiche plus propre.</span>
            </Link>
            {user?.role === "ADMIN" ? (
              <Link className="dashboard-action" to="/admin">
                <strong>Mettre a jour le contenu</strong>
                <span>Gerez les cours, modules et lecons depuis la zone admin.</span>
              </Link>
            ) : null}
          </div>
        </article>
      </section>

      <section className="dashboard-card">
        <div className="dashboard-card-head">
          <h3>Apercu du catalogue</h3>
          <Link className="btn ghost" to="/courses">
            Voir tout
          </Link>
        </div>

        {loadingCourses ? (
          <p className="muted">Chargement du catalogue...</p>
        ) : highlightedCourses.length === 0 ? (
          <p className="muted">Aucun cours publie pour le moment.</p>
        ) : (
          <div className="dashboard-course-list">
            {highlightedCourses.map((course) => (
              <Link key={course.id} className="dashboard-course-item" to={`/courses/${course.id}`}>
                <div>
                  <div className="row">
                    {course.category ? <span className="mini-chip">{course.category}</span> : null}
                    {course.level ? <span className="course-level">{course.level}</span> : null}
                  </div>
                  <h4>{course.title}</h4>
                  <p>{course.shortDescription ?? course.description ?? "Cours disponible."}</p>
                </div>
                <div className="dashboard-course-meta">
                  <strong>{course.estimatedHours ?? 0}h</strong>
                  <span>{course.featured ? "Mis en avant" : "Disponible"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
