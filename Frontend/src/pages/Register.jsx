import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import Field from "../components/Field";
import { INDUSTRIES, INVESTOR_TYPES, STAGES, fieldErrors, typeLabel } from "../utils/format";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Name is required.";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email.";
  if (f.password.length < 8) e.password = "At least 8 characters.";
  else if (!/[A-Za-z]/.test(f.password) || !/\d/.test(f.password)) e.password = "Must contain a letter and a number.";
  if (f.role === "investor") {
    const { min, max } = f;
    if (min !== "" && (isNaN(min) || Number(min) < 0)) e["profile.investmentRange.min"] = "Enter a valid amount.";
    if (max !== "" && (isNaN(max) || Number(max) < 0)) e["profile.investmentRange.max"] = "Enter a valid amount.";
    if (min !== "" && max !== "" && Number(min) > Number(max)) e["profile.investmentRange.max"] = "Max must be ≥ min.";
  }
  return e;
}

function buildProfile(f) {
  const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== "" && v !== undefined));
  if (f.role === "founder") {
    return clean({ companyName: f.companyName.trim(), designation: f.designation.trim(), location: f.location.trim() });
  }
  const profile = { investorType: f.investorType };
  if (f.min !== "" || f.max !== "") {
    profile.investmentRange = clean({ min: f.min === "" ? undefined : Number(f.min), max: f.max === "" ? undefined : Number(f.max), currency: "USD" });
  }
  const inds = f.industries.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (inds.length) profile.preferredIndustries = inds;
  if (f.stages.length) profile.preferredStages = f.stages;
  return profile;
}

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [f, setF] = useState({ role: "founder", name: "", email: "", password: "", companyName: "", designation: "", location: "", investorType: "angel", min: "", max: "", industries: "", stages: [] });
  const [errors, setErrors] = useState({});
  const [general, setGeneral] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const err = (k) => errors[k] || errors[k.split(".").pop()];
  const toggleStage = (v) => setF((s) => ({ ...s, stages: s.stages.includes(v) ? s.stages.filter((x) => x !== v) : [...s.stages, v] }));

  async function onSubmit(e) {
    e.preventDefault();
    setGeneral("");
    const v = validate(f);
    setErrors(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try {
      await register({ name: f.name.trim(), email: f.email.trim(), password: f.password, role: f.role, profile: buildProfile(f) });
      toast.success("Account created. Please log in.");
      navigate("/login");
    } catch (ex) {
      if (ex.status === 409) setErrors({ email: ex.message || "An account with this email already exists." });
      else if (ex.status === 422 && ex.errors?.length) { setErrors(fieldErrors(ex)); setGeneral(ex.message); }
      else setGeneral(ex.status >= 500 || !ex.status ? "Something went wrong. Please try again." : ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card auth-card" style={{ maxWidth: 640 }}>
      <h1>Create your account</h1>
      <form onSubmit={onSubmit} noValidate>
        <div aria-live="polite">{general && <div className="form-error">{general}</div>}</div>

        <fieldset>
          <legend>I am a…</legend>
          <div className="choice-row">
            <label><input type="radio" name="role" value="founder" checked={f.role === "founder"} onChange={set("role")} /> Founder</label>
            <label><input type="radio" name="role" value="investor" checked={f.role === "investor"} onChange={set("role")} /> Investor</label>
          </div>
        </fieldset>

        <div className="form-grid">
          <Field label="Name" error={err("name")}><input value={f.name} onChange={set("name")} autoComplete="name" /></Field>
          <Field label="Email" error={err("email")}><input type="email" value={f.email} onChange={set("email")} autoComplete="email" /></Field>
        </div>
        <Field label="Password" error={err("password")} hint="8+ characters, with a letter and a number."><input type="password" value={f.password} onChange={set("password")} autoComplete="new-password" /></Field>

        {f.role === "founder" ? (
          <div className="form-grid">
            <Field label="Company name" error={err("profile.companyName")}><input value={f.companyName} onChange={set("companyName")} /></Field>
            <Field label="Designation" error={err("profile.designation")}><input value={f.designation} onChange={set("designation")} /></Field>
            <Field label="Location" error={err("profile.location")}><input value={f.location} onChange={set("location")} /></Field>
          </div>
        ) : (
          <>
            <div className="form-grid">
              <Field label="Investor type" error={err("profile.investorType")}>
                <select value={f.investorType} onChange={set("investorType")}>{INVESTOR_TYPES.map((t) => <option key={t} value={t}>{typeLabel(t)}</option>)}</select>
              </Field>
              <Field label="Min investment (USD)" error={err("profile.investmentRange.min")}><input type="number" min="0" value={f.min} onChange={set("min")} /></Field>
              <Field label="Max investment (USD)" error={err("profile.investmentRange.max")}><input type="number" min="0" value={f.max} onChange={set("max")} /></Field>
            </div>
            <Field label="Preferred industries" error={err("profile.preferredIndustries")} hint={`Comma-separated, e.g. ${INDUSTRIES.slice(0, 3).join(", ")}`}>
              <input value={f.industries} onChange={set("industries")} />
            </Field>
            <fieldset>
              <legend>Preferred stages</legend>
              <div className="choice-row">
                {STAGES.map((s) => (
                  <label key={s.value}><input type="checkbox" checked={f.stages.includes(s.value)} onChange={() => toggleStage(s.value)} /> {s.label}</label>
                ))}
              </div>
              {err("profile.preferredStages") && <small className="field-error" role="alert">{err("profile.preferredStages")}</small>}
            </fieldset>
          </>
        )}

        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Creating account…" : "Register"}</button>
      </form>
      <p className="muted" style={{ marginTop: 12 }}>Already registered? <Link to="/login">Log in</Link></p>
    </div>
  );
}
