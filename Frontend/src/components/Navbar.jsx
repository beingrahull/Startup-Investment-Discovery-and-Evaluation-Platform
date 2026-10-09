import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "./RoleBadge";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const cls = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  async function onLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">StartupMeu</Link>
        {user && (
          <nav className="nav-links" aria-label="Main">
            <NavLink to="/dashboard" className={cls}>Dashboard</NavLink>
            <NavLink to="/asks" end className={cls}>Browse</NavLink>
            {user.role === "founder" && <NavLink to="/asks/new" className={cls}>Create Ask</NavLink>}
            <NavLink to="/connections" className={cls}>Connections</NavLink>
          </nav>
        )}
        <div className="nav-right">
          {user ? (
            <>
              <span>{user.name} <RoleBadge role={user.role} /></span>
              <button type="button" className="btn btn-sm" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="btn btn-sm" to="/login">Login</Link>
              <Link className="btn btn-sm btn-primary" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
