import { Link } from "react-router-dom";
import { idOf, industryLabel, money, stageLabel } from "../utils/format";
import ConnectButton from "./ConnectButton";

export default function AskCard({ ask }) {
  return (
    <article className="card ask-card">
      <div className="row spread">
        <span className="pill">{industryLabel(ask.industry)}</span>
        <span className="pill pill-muted">{stageLabel(ask.stage)}</span>
      </div>
      <h3><Link className="stretched" to={`/asks/${idOf(ask)}`}>{ask.startupName}</Link></h3>
      <p className="muted tagline">{ask.tagline}</p>
      <div className="row spread">
        <strong>{money(ask.fundingGoal, ask.currency)}</strong>
        <span className="muted">{ask.location || ask.founder?.profile?.location || ""}</span>
      </div>
      <div className="actions"><ConnectButton ask={ask} size="sm" /></div>
    </article>
  );
}
