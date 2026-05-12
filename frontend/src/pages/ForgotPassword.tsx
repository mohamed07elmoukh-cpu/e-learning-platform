import { useState } from "react";
import { http } from "../api/http";
import { endpoints } from "../api/endpoints";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const data = await http.post<{ message: string }>(endpoints.auth.forgotPassword, { email }, false);
      setMessage(data.message ?? "Si l'adresse existe, un e-mail a ete envoye.");
    } catch (err: any) {
      setError(err?.message ?? "Impossible d'envoyer le lien.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card narrow">
      <h2>Reinitialiser mon mot de passe</h2>
      <p className="muted">Entrez votre adresse e-mail pour recevoir un lien.</p>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert">{error}</div>}

      <form onSubmit={onSubmit} className="form">
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </label>
        <button className="btn primary" disabled={loading}>
          {loading ? "Envoi..." : "Envoyer le lien de reinitialisation"}
        </button>
      </form>
    </div>
  );
}
