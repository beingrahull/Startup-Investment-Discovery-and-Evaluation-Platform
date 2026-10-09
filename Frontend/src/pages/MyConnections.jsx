import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { fmtDate, idOf, industryLabel, money, stageLabel, typeLabel } from "../utils/format";
import { useApiError } from "../utils/hooks";

export default function MyConnections() {
  const { user } = useAuth();
  const toast = useToast();
  const handleError = useApiError();
  const isFounder = user.role === "founder";
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null); // { conn, status }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get("/api/connections/mine")
      .then((d) => !cancelled && setItems(d.connections || []))
      .catch((e) => !cancelled && setError(handleError(e)));
    return () => { cancelled = true; };
  }, [handleError]);

  async function decide() {
    const { conn, status } = pending;
    setBusy(true);
    try {
      const d = await api.patch(`/api/connections/${idOf(conn)}`, { status });
      // Update status locally; PATCH response may not carry the populated investor/ask.
      setItems((list) => list.map((c) => (idOf(c) === idOf(conn) ? { ...c, status: d.connection?.status || status } : c)));
      toast.success(`Request ${status}.`);
    } catch (e) {
      toast.error(handleError(e));
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  if (error) return <EmptyState title="Couldn't load connections" message={error} />;
  if (!items) return <Spinner />;

  return (
    <>
      <div className="page-head"><h1>{isFounder ? "Incoming requests" : "My requests"}</h1></div>
      {items.length === 0 ? (
        <EmptyState
          title="No connections yet"
          message={isFounder ? "Investor requests on your asks will show up here." : "Find an ask you like and hit Connect."}
          action={!isFounder && <Link className="btn btn-primary" to="/asks">Browse asks</Link>}
        />
      ) : (
        <div className="stack">
          {items.map((c) => (
            <article className="card" key={idOf(c)}>
              <div className="row spread">
                <h3 style={{ margin: 0 }}>
                  {isFounder ? (c.investor?.name || "Investor") : (<Link to={`/asks/${idOf(c.ask)}`}>{c.ask?.startupName || "Ask"}</Link>)}
                </h3>
                <StatusBadge status={c.status} />
              </div>

              {isFounder ? (
                <p className="muted">
                  {c.investor?.email}
                  {c.investor?.profile?.investorType && <> · {typeLabel(c.investor.profile.investorType)}</>}
                  {c.investor?.profile?.investmentRange && <> · {money(c.investor.profile.investmentRange.min, c.investor.profile.investmentRange.currency)}–{money(c.investor.profile.investmentRange.max, c.investor.profile.investmentRange.currency)}</>}
                </p>
              ) : (
                <p className="muted">{c.ask?.tagline}</p>
              )}

              <p className="muted">
                {isFounder && c.ask && <>For <Link to={`/asks/${idOf(c.ask)}`}>{c.ask.startupName}</Link> · {industryLabel(c.ask.industry)} · {stageLabel(c.ask.stage)} · </>}
                Sent {fmtDate(c.createdAt)}
              </p>
              {c.message && <p style={{ whiteSpace: "pre-wrap" }}>“{c.message}”</p>}

              {isFounder && c.status === "pending" && (
                <div className="row">
                  <button className="btn btn-primary btn-sm" onClick={() => setPending({ conn: c, status: "accepted" })}>Accept</button>
                  <button className="btn btn-sm" onClick={() => setPending({ conn: c, status: "declined" })}>Decline</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!pending}
        title={pending?.status === "accepted" ? "Accept this request?" : "Decline this request?"}
        confirmLabel={pending?.status === "accepted" ? "Accept" : "Decline"}
        danger={pending?.status === "declined"}
        busy={busy}
        onConfirm={decide}
        onCancel={() => setPending(null)}
      >
        <p className="muted">From {pending?.conn?.investor?.name || "this investor"}. This can't be undone.</p>
      </ConfirmModal>
    </>
  );
}
