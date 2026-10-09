import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Field from "../components/Field";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to={from || "/dashboard"} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), password);
      navigate(from || "/dashboard", { replace: true });
    } catch (err) {
      if (err.status === 401) setError("Invalid email or password.");
      else if (err.status === 422 || err.status === 400) setError(err.message);
      else if (!err.status || err.status >= 500) setError("Something went wrong. Please try again.");
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card auth-card">
      <h1>Log in</h1>
      <form onSubmit={onSubmit} noValidate>
        <div aria-live="polite">{error && <div className="form-error">{error}</div>}</div>
        <Field label="Email"><input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label="Password"><input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        <button className="btn btn-primary" type="submit" disabled={busy || !email || !password}>{busy ? "Logging in…" : "Log in"}</button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}
