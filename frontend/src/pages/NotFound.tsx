import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="card">
      <h2>404</h2>
      <p className="muted">Page introuvable.</p>
      <Link className="btn" to="/">Retour accueil</Link>
    </div>
  );
}
