import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api";

export default function AppLayout() {
  const nav = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    api.get("/auth/me").then(res => setEmail(res.data?.email ?? null)).catch(() => {});
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };

  return (
    <>
      <nav className="navbar navbar-expand bg-white border-bottom">
        <div className="container">
          <NavLink to="/" className="navbar-brand fw-bold">JobTracker</NavLink>

          <div className="navbar-nav">
            <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
            <NavLink to="/applications" className="nav-link">Applications</NavLink>
          </div>

          <div className="ms-auto d-flex align-items-center gap-2">
            {email && <span className="text-muted small d-none d-md-inline">{email}</span>}
            <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="container py-4">
        <Outlet />
      </main>
    </>
  );
}
