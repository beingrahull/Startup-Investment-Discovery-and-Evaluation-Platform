// src/utils/format.js
export const INDUSTRIES = ["fintech","healthtech","edtech","saas","ecommerce","marketplace","ai_ml","cleantech","agritech","logistics","gaming","other"];
export const STAGES = [
  { value: "idea", label: "Idea" }, { value: "pre-seed", label: "Pre-seed" },
  { value: "seed", label: "Seed" }, { value: "seriesA", label: "Series A" },
  { value: "seriesB", label: "Series B" }, { value: "growth", label: "Growth" },
];
export const INVESTOR_TYPES = ["angel", "vc", "syndicate", "corporate", "other"];
// ASSUMPTION: backend accepts any ISO-style currency string; spec doesn't list an enum.
export const CURRENCIES = ["USD", "INR", "EUR", "GBP"];

const INDUSTRY_LABELS = { fintech: "Fintech", healthtech: "Healthtech", edtech: "Edtech", saas: "SaaS", ecommerce: "E-commerce", marketplace: "Marketplace", aiml: "AI / ML", cleantech: "Cleantech", agritech: "Agritech", logistics: "Logistics", gaming: "Gaming", other: "Other" };
export const industryLabel = (v) => INDUSTRY_LABELS[v] || v || "—";
export const stageLabel = (v) => STAGES.find((s) => s.value === v)?.label || v || "—";
export const typeLabel = (v) => (v === "vc" ? "VC" : v ? v[0].toUpperCase() + v.slice(1) : "—");

// ASSUMPTION: populated sub-documents may expose `id` or `_id`; accept either (or a raw id string).
export function idOf(x) {
  if (!x) return null;
  if (typeof x === "string") return x;
  return x.id ?? x._id ?? null;
}

export function canConnect(user, ask) {
  return user?.role === "investor" && idOf(ask?.founder) !== user.id;
}

export function money(n, currency = "USD") {
  if (n === undefined || n === null || n === "") return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(n);
  } catch {
    return `${currency} ${n}`;
  }
}

export function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";
}

// Only allow http(s) links (blocks javascript: URLs from user-supplied fields).
export function safeUrl(u) {
  return typeof u === "string" && /^https?:\/\//i.test(u) ? u : null;
}

// Turns backend errors[] into { "profile.companyName": msg, companyName: msg } so forms can look up either form.
export function fieldErrors(err) {
  const out = {};
  (err?.errors || []).forEach(({ field, message }) => {
    if (!field) return;
    out[field] = message;
    const last = field.split(".").pop();
    if (!out[last]) out[last] = message;
  });
  return out;
}

export const num = (v) => (v === "" || v === undefined ? undefined : Number(v));
