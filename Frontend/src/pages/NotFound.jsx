import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";

export default function NotFound() {
  return <EmptyState title="Page not found" message="That page doesn't exist." action={<Link className="btn btn-primary" to="/dashboard">Go to dashboard</Link>} />;
}
