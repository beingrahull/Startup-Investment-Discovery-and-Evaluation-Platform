import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleRoute({ allow, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allow)
    return (
      <div className="card empty">
        <h2>Not allowed</h2>
        <p>This page is only available to {allow}s.</p>
        <Link className="btn" to="/dashboard">Back to dashboard</Link>
      </div>
    );
  return children;
}
