import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { tokenStorage } from "../auth/tokenStorage";
import { decodeJwtPayload } from "../utils/jwt";

type JwtPayload = {
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  fullName?: string;
  role?: "STUDENT" | "INSTRUCTOR" | "ADMIN";
};

function formatRemaining(ms: number) {
  if (ms <= 0) return "Expire";
  const totalMinutes = Math.ceil(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export default function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const accessToken = tokenStorage.getAccessToken();
  const payload = useMemo(
    () => (accessToken ? decodeJwtPayload<JwtPayload>(accessToken) : null),
    [accessToken]
  );

  const [age, setAge] = useState(user?.age?.toString() ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate("/login", { replace: true });
    }
  }, [user, accessToken, navigate]);

  const role = user?.role ?? payload?.role ?? "STUDENT";
  const roleClass = role === "ADMIN" ? "admin" : role === "INSTRUCTOR" ? "instructor" : "student";
  const displayName = user?.fullName ?? user?.email ?? "Profil";
  const expDate = payload?.exp ? new Date(payload.exp * 1000) : null;
  const remainingMs = payload?.exp ? payload.exp * 1000 - Date.now() : null;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    const ageValue = age.trim() === "" ? null : Number(age);
    if (ageValue !== null && (!Number.isFinite(ageValue) || ageValue < 0)) {
      setError("Age invalide.");
      setSaving(false);
      return;
    }

    try {
      await updateProfile({ age: ageValue, phone: phone.trim() || null });
      setMessage("Profil mis a jour.");
    } catch (err: any) {
      setError(err?.message ?? "Impossible de mettre a jour.");
    } finally {
      setSaving(false);
    }
  }

  if (!user || !accessToken) {
    return null;
  }

  return (
    <div className="card narrow profile-card">
      <div className="profile-header">
        <div className="profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
        <div className="profile-meta">
          <h2>{displayName}</h2>
          <div className="profile-role">
            <span className={`role-badge ${roleClass}`}>{role}</span>
          </div>
          {user.email ? <p className="muted">{user.email}</p> : null}
        </div>
      </div>

      <div className="divider" />

      <form className="form" onSubmit={handleSave}>
        <h3>Informations personnelles</h3>
        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert">{error}</div>}
        <label>
          Age
          <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ex: 21" />
        </label>
        <label>
          Telephone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ex: +2126..." />
        </label>
        <button className="btn primary" type="submit" disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <div className="divider" />

      <div className="profile-session">
        <h3>Session</h3>
        <div className="muted">
          Expiration: {expDate ? expDate.toLocaleString() : "Inconnue"}
        </div>
        <div className="muted">
          Temps restant: {remainingMs !== null ? formatRemaining(remainingMs) : "Inconnu"}
        </div>
      </div>

      <div className="row right profile-actions">
        <button className="btn primary" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}


