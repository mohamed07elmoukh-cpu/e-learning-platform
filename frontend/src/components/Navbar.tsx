import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const displayName =
    user?.fullName?.split(" ").filter(Boolean)[0] ?? user?.email ?? "Profil";
  const role = user?.role ?? "STUDENT";
  const roleClass = role === "ADMIN" ? "admin" : role === "INSTRUCTOR" ? "instructor" : "student";

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link className="logo" to="/">
          <span className="logo-mark" />
          E-Learning
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Accueil
          </NavLink>
          <NavLink to="/courses">Cours</NavLink>
          <a href="#pricing">Tarifs</a>
          <NavLink to="/contact">Contact</NavLink>
          {isAuthenticated ? <NavLink to="/dashboard">Dashboard</NavLink> : null}
          {isAuthenticated ? <NavLink to="/profile">Profil</NavLink> : null}
          {isAuthenticated && (user?.role === "INSTRUCTOR" || user?.role === "ADMIN") ? (
            <NavLink to="/instructor">Instructor</NavLink>
          ) : null}
          {isAuthenticated && user?.role === "ADMIN" ? <NavLink to="/admin">Admin</NavLink> : null}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <div className="user-chip">
                <span className="user-avatar">{displayName.charAt(0).toUpperCase()}</span>
                <div className="user-meta">
                  <div className="user-line">
                    <span className="user-name">{displayName}</span>
                    <span className={`role-badge ${roleClass}`}>{role}</span>
                  </div>
                  {user?.email ? <span className="user-email">{user.email}</span> : null}
                </div>
              </div>
              <button className="btn outline" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn outline" to="/login">
                Login
              </Link>
              <Link className="btn primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
