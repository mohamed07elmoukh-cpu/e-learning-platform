import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.fullName ?? user?.email ?? "Utilisateur";

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>
        Bienvenue, <b>{displayName}</b>.
      </p>
      <p>
        Role: <b>{user?.role ?? "STUDENT"}</b>
      </p>

      <div className="row">
        <Link className="btn" to="/courses">
          Voir les cours
        </Link>
      </div>
    </div>
  );
}
