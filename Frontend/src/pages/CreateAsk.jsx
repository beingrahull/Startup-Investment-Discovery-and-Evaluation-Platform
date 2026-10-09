import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import ChipInput from "../components/ChipInput";
import Field from "../components/Field";
import { CURRENCIES, INDUSTRIES, STAGES, fieldErrors, industryLabel, num } from "../utils/format";
import { useApiError } from "../utils/hooks";

const INIT = {
  startupName: "", tagline: "", description: "", industry: "saas", stage: "seed",
  location: "", website: "", logoUrl: "", fundingGoal: "", currency: "USD", equityOffered: "",
  teamSize: "", pitchDeckUrl: "", status: "published",
  monthlyRevenue: "", activeUsers: "", growthRate: "",
};

export default function CreateAsk() {
  const navigate = useNavigate();
  const toast = useToast();
  const handleError = useApiError();
  const [f, setF] = useState(INIT);
  const [useOfFunds, setUseOfFunds] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [errors, setErrors] = useState({});
  const [general, setGeneral] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const err = (k) => errors[k] || errors[k.split(".").pop()];

  function validate() {
    const e = {};
    ["startupName", "tagline", "description"].forEach((k) => { if (!f[k].trim()) e[k] = "Required."; });
    if (f.fundingGoal === "" || !(Number(f.fundingGoal) > 0)) e.fundingGoal = "Enter a goal greater than 0.";
    ["equityOffered", "teamSize", "monthlyRevenue", "activeUsers", "growthRate"].forEach((k) => {
      if (f[k] !== "" && isNaN(f[k])) e[k] = "Must be a number.";
    });
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    setGeneral("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    const text = (s) => (s.trim() === "" ? undefined : s.trim());
    const traction = {
      monthlyRevenue: num(f.monthlyRevenue), activeUsers: num(f.activeUsers), growthRate: num(f.growthRate),
      keyMilestones: milestones.length ? milestones : undefined,
    };
    const hasTraction = Object.values(traction).some((x) => x !== undefined);
    // undefined values are dropped by JSON.stringify, so optional fields are simply omitted.
    const body = {
      startupName: f.startupName.trim(), tagline: f.tagline.trim(), description: f.description.trim(),
      industry: f.industry, stage: f.stage, location: text(f.location), website: text(f.website), logoUrl: text(f.logoUrl),
      fundingGoal: Number(f.fundingGoal), currency: f.currency, equityOffered: num(f.equityOffered),
      useOfFunds: useOfFunds.length ? useOfFunds : undefined,
      traction: hasTraction ? traction : undefined,
      teamSize: num(f.teamSize), pitchDeckUrl: text(f.pitchDeckUrl),
      status: f.status, // ASSUMPTION: backend accepts `status` on create (it's part of the Ask shape).
    };

    setBusy(true);
    try {
      await api.post("/api/asks", body);
      toast.success("Ask created.");
      navigate("/asks");
    } catch (ex) {
      if (ex.status === 422 && ex.errors?.length) { setErrors(fieldErrors(ex)); setGeneral(ex.message); }
      else setGeneral(handleError(ex));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 760, margin: "0 auto" }}>
      <h1>Create an Ask</h1>
      <form onSubmit={onSubmit} noValidate>
        <div aria-live="polite">{general && <div className="form-error">{general}</div>}</div>

        <h2>Overview</h2>
        <div className="form-grid">
          <Field label="Startup name *" error={err("startupName")}><input value={f.startupName} onChange={set("startupName")} /></Field>
          <Field label="Tagline *" error={err("tagline")}><input value={f.tagline} onChange={set("tagline")} /></Field>
        </div>
        <Field label="Description *" error={err("description")}><textarea value={f.description} onChange={set("description")} /></Field>
        <div className="form-grid">
          <Field label="Industry *" error={err("industry")}>
            <select value={f.industry} onChange={set("industry")}>{INDUSTRIES.map((i) => <option key={i} value={i}>{industryLabel(i)}</option>)}</select>
          </Field>
          <Field label="Stage *" error={err("stage")}>
            <select value={f.stage} onChange={set("stage")}>{STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
          </Field>
          <Field label="Location" error={err("location")}><input value={f.location} onChange={set("location")} /></Field>
          <Field label="Team size" error={err("teamSize")}><input type="number" min="1" value={f.teamSize} onChange={set("teamSize")} /></Field>
          <Field label="Website" error={err("website")}><input type="url" value={f.website} onChange={set("website")} placeholder="https://" /></Field>
          <Field label="Logo URL" error={err("logoUrl")}><input type="url" value={f.logoUrl} onChange={set("logoUrl")} placeholder="https://" /></Field>
          <Field label="Pitch deck URL" error={err("pitchDeckUrl")}><input type="url" value={f.pitchDeckUrl} onChange={set("pitchDeckUrl")} placeholder="https://" /></Field>
        </div>

        <h2 className="form-section">The Ask</h2>
        <div className="form-grid">
          <Field label="Funding goal *" error={err("fundingGoal")}><input type="number" min="0" value={f.fundingGoal} onChange={set("fundingGoal")} /></Field>
          <Field label="Currency" error={err("currency")}>
            <select value={f.currency} onChange={set("currency")}>{CURRENCIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Equity offered (%)" error={err("equityOffered")}><input type="number" min="0" max="100" step="any" value={f.equityOffered} onChange={set("equityOffered")} /></Field>
        </div>
        <ChipInput label="Use of funds" items={useOfFunds} onChange={setUseOfFunds} placeholder="e.g. Hiring — press Enter" error={err("useOfFunds")} />

        <h2 className="form-section">Traction</h2>
        <div className="form-grid">
          <Field label="Monthly revenue" error={err("traction.monthlyRevenue")}><input type="number" min="0" value={f.monthlyRevenue} onChange={set("monthlyRevenue")} /></Field>
          <Field label="Active users" error={err("traction.activeUsers")}><input type="number" min="0" value={f.activeUsers} onChange={set("activeUsers")} /></Field>
          <Field label="Growth rate (%)" error={err("traction.growthRate")}><input type="number" step="any" value={f.growthRate} onChange={set("growthRate")} /></Field>
        </div>
        <ChipInput label="Key milestones" items={milestones} onChange={setMilestones} placeholder="e.g. 1,000 paying users — press Enter" error={err("traction.keyMilestones")} />

        <h2 className="form-section">Visibility</h2>
        <Field label="Status" error={err("status")} hint="Only published asks appear in the feed.">
          <select value={f.status} onChange={set("status")}><option value="published">Published</option><option value="draft">Draft</option></select>
        </Field>

        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Creating…" : "Create Ask"}</button>
      </form>
    </div>
  );
}
