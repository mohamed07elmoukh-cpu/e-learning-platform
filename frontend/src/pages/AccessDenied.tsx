import { Link } from "react-router-dom";

export default function AccessDenied() {
  return (
    <div className="card">
      <h2>Acces refuse</h2>
      <p className="muted">Vous n'avez pas les droits pour acceder a cette page.</p>
      <Link className="btn" to="/dashboard">
        Retour dashboard
      </Link>
    </div>
  );
}
