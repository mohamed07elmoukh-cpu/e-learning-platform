import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(fullName, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message ?? "Erreur d'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card narrow">
      <h2>Register</h2>

      {error && <div className="alert">{error}</div>}

      <form onSubmit={onSubmit} className="form">
        <label>
          Nom complet
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </label>

        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>

        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        </label>

        <button className="btn" disabled={loading}>
          {loading ? "Création..." : "Créer un compte"}
        </button>
      </form>

      <p className="muted">
        Déjà un compte ? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
