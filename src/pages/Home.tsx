import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { decodeJwt } from "../utils/jwt";

type Me = { id?: string; email?: string; name?: string };

export default function Home() {
  const nav = useNavigate();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { nav("/login", { replace: true }); return; }

    api.get("/auth/me")
      .then((res) => setMe(res.data))
      .catch(() => {
        const payload = decodeJwt<{ email?: string; name?: string }>(token);
        setMe({ email: payload?.email, name: payload?.name });
      });
  }, [nav]);

  function logout() {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  }

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <div className="card shadow-sm p-4">
        <h1 className="mb-1">Welcome {me?.name ? `, ${me.name}` : ""} 👋</h1>
        <p className="text-muted mb-4">{me?.email || "Signed in"}</p>

        <div className="d-flex gap-2">
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
          <Link to="/applications" className="btn btn-outline-primary">
            View Applications
          </Link>
          <button className="btn btn-outline-secondary ms-auto" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
