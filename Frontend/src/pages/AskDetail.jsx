import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import ConnectButton from "../components/ConnectButton";
import EmptyState from "../components/EmptyState";
import Spinner from "../components/Spinner";
import { fmtDate, industryLabel, money, safeUrl, stageLabel } from "../utils/format";
import { useApiError } from "../utils/hooks";

function KV({ items }) {
  const shown = items.filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (!shown.length) return <p className="muted">Nothing provided.</p>;
  return <dl className="kv">{shown.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}

const Ext = ({ href }) => (safeUrl(href) ? <a href={href} target="_blank" rel="noopener noreferrer">{href}</a> : null);

export default function AskDetail() {
  const { id } = useParams();
  const handleError = useApiError();
  const [ask, setAsk] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setAsk(null);
    setError("");
    api.get(`/api/asks/${id}`)
      .then((d) => !cancelled && setAsk(d.ask))
      .catch((e) => !cancelled && setError(handleError(e)));
    return () => { cancelled = true; };
  }, [id, handleError]);

  if (error) return <EmptyState title="Couldn't load this ask" message={error} action={<Link className="btn" to="/asks">Back to browse</Link>} />;
  if (!ask) return <Spinner />;

  const t = ask.traction || {};
  const f = ask.founder || {};
  const logo = safeUrl(ask.logoUrl);

  return (
    <div className="stack">
      <Link to="/asks">← Back to browse</Link>

      <section className="card detail-section">
        <div className="page-head">
          <div className="row">
            {logo && <img className="logo" src={logo} alt="" />}
            <div>
              <h1>{ask.startupName}</h1>
              <p className="muted">{ask.tagline}</p>
            </div>
          </div>
          <ConnectButton ask={ask} />
        </div>
        <div className="row" style={{ marginBottom: 12 }}>
          <span className="pill">{industryLabel(ask.industry)}</span>
          <span className="pill pill-muted">{stageLabel(ask.stage)}</span>
          {ask.status !== "published" && <span className="pill pill-warning">{ask.status}</span>}
        </div>
        <h2>Overview</h2>
        <p style={{ whiteSpace: "pre-wrap" }}>{ask.description}</p>
        <KV items={[["Location", ask.location], ["Team size", ask.teamSize], ["Posted", fmtDate(ask.createdAt)]]} />
        {(safeUrl(ask.website) || safeUrl(ask.pitchDeckUrl)) && (
          <p style={{ marginTop: 12 }}>
            {safeUrl(ask.website) && <>Website: <Ext href={ask.website} /> </>}
            {safeUrl(ask.pitchDeckUrl) && <>Pitch deck: <Ext href={ask.pitchDeckUrl} /></>}
          </p>
        )}
      </section>

      <section className="card detail-section">
        <h2>Traction</h2>
        <KV items={[
          ["Monthly revenue", t.monthlyRevenue != null ? money(t.monthlyRevenue, ask.currency) : null],
          ["Active users", t.activeUsers?.toLocaleString?.()],
          ["Growth rate", t.growthRate != null ? `${t.growthRate}%` : null], // ASSUMPTION: growthRate is a percentage
        ]} />
        {t.keyMilestones?.length > 0 && <><h3 style={{ marginTop: 12 }}>Key milestones</h3><ul>{t.keyMilestones.map((m, i) => <li key={i}>{m}</li>)}</ul></>}
      </section>

      <section className="card detail-section">
        <h2>The Ask</h2>
        <div className="stat-big">{money(ask.fundingGoal, ask.currency)}</div>
        <KV items={[["Equity offered", ask.equityOffered != null ? `${ask.equityOffered}%` : null]]} />
        {ask.useOfFunds?.length > 0 && <><h3 style={{ marginTop: 12 }}>Use of funds</h3><ul>{ask.useOfFunds.map((u, i) => <li key={i}>{u}</li>)}</ul></>}
      </section>

      <section className="card detail-section">
        <h2>Founder</h2>
        <KV items={[["Name", f.name], ["Company", f.profile?.companyName], ["Location", f.profile?.location], ["Email", f.email]]} />
      </section>
    </div>
  );
}
