import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import AskCard from "../components/AskCard";
import EmptyState from "../components/EmptyState";
import { SkeletonGrid } from "../components/Skeleton";
import { idOf } from "../utils/format";
import { useApiError } from "../utils/hooks";

export default function Dashboard() {
  const { user } = useAuth();
  const handleError = useApiError();
  const isFounder = user.role === "founder";
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setData(null);
    const asksReq = api.get(isFounder ? "/api/asks?limit=100" : "/api/asks?limit=3");
    Promise.all([asksReq, api.get("/api/connections/mine")])
      .then(([a, c]) => {
        if (cancelled) return;
        const pendingCount = (c.connections || []).filter((x) => x.status === "pending").length;
        if (isFounder) {
          const mine = a.asks.filter((x) => idOf(x.founder) === user.id);
          setData({ mine, capped: a.total > a.asks.length, pendingCount });
        } else {
          const recent = [...a.asks].sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt)).slice(0, 3);
          setData({ recent, pendingCount });
        }
      })
      .catch((e) => !cancelled && setError(handleError(e)));
    return () => { cancelled = true; };
  }, [isFounder, user.id, handleError]);

  if (error) return <EmptyState title="Couldn't load your dashboard" message={error} />;

  return (
    <>
      <div className="page-head"><h1>Welcome, {user.name}</h1></div>

      {!data ? (
        <SkeletonGrid count={3} />
      ) : isFounder ? (
        <div className="grid">
          <div className="card">
            <div className="muted">Your asks</div>
            <div className="stat-big">{data.mine.length}{data.capped ? "+" : ""}</div>
            <p>You have {data.mine.length} ask{data.mine.length === 1 ? "" : "s"}.</p>
            <Link className="btn btn-primary" to="/asks/new">Create Ask</Link>
          </div>
          <div className="card">
            <div className="muted">Pending incoming connections</div>
            <div className="stat-big">{data.pendingCount}</div>
            <Link className="btn" to="/connections">Review requests</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid" style={{ marginBottom: 24 }}>
            <div className="card">
              <div className="muted">Pending sent connections</div>
              <div className="stat-big">{data.pendingCount}</div>
              <Link className="btn" to="/connections">View my requests</Link>
            </div>
          </div>
          <div className="page-head"><h2>Recent asks</h2><Link to="/asks">Browse all →</Link></div>
          {data.recent.length === 0
            ? <EmptyState title="No asks yet" message="Check back soon." />
            : <div className="grid">{data.recent.map((a) => <AskCard key={idOf(a)} ask={a} />)}</div>}
        </>
      )}
    </>
  );
}
