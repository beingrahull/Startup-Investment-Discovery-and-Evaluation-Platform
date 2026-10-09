import { useEffect, useState } from "react";
import { api } from "../api/client";
import AskCard from "../components/AskCard";
import EmptyState from "../components/EmptyState";
import Field from "../components/Field";
import { SkeletonGrid } from "../components/Skeleton";
import { INDUSTRIES, STAGES, industryLabel } from "../utils/format";
import { useApiError, useDebounced } from "../utils/hooks";

const LIMIT = 9;
const EMPTY = { industry: "", stage: "", q: "", minGoal: "", maxGoal: "" };

export default function AskFeed() {
  const handleError = useApiError();
  const [filters, setFilters] = useState(EMPTY);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null); // null = loading
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  // Debounce free-typing fields; selects apply immediately.
  const q = useDebounced(filters.q, 350);
  const minGoal = useDebounced(filters.minGoal, 350);
  const maxGoal = useDebounced(filters.maxGoal, 350);
  const { industry, stage } = filters;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page, limit: LIMIT });
    Object.entries({ industry, stage, q: q.trim(), minGoal, maxGoal }).forEach(([k, v]) => v !== "" && params.set(k, v));
    setData(null);
    setError("");
    api.get(`/api/asks?${params}`)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(handleError(e)));
    return () => { cancelled = true; };
  }, [industry, stage, q, minGoal, maxGoal, page, retry, handleError]);

  const change = (k) => (e) => { setFilters((f) => ({ ...f, [k]: e.target.value })); setPage(1); };
  const reset = () => { setFilters(EMPTY); setPage(1); };
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <>
      <div className="page-head"><h1>Browse asks</h1></div>

      <div className="card filters" role="search">
        <Field label="Search"><input value={filters.q} onChange={change("q")} placeholder="Startup, tagline…" /></Field>
        <Field label="Industry">
          <select value={filters.industry} onChange={change("industry")}>
            <option value="">All</option>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{industryLabel(i)}</option>)}
          </select>
        </Field>
        <Field label="Stage">
          <select value={filters.stage} onChange={change("stage")}>
            <option value="">All</option>
            {STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </Field>
        <Field label="Min goal"><input type="number" min="0" value={filters.minGoal} onChange={change("minGoal")} /></Field>
        <Field label="Max goal"><input type="number" min="0" value={filters.maxGoal} onChange={change("maxGoal")} /></Field>
        <button type="button" className="btn" onClick={reset} disabled={!hasFilters}>Reset</button>
      </div>

      {error ? (
        <EmptyState title="Couldn't load asks" message={error} action={<button className="btn" onClick={() => setRetry((n) => n + 1)}>Try again</button>} />
      ) : !data ? (
        <SkeletonGrid count={6} />
      ) : data.asks.length === 0 ? (
        <EmptyState title="No asks found" message="Nothing matches your filters." action={<button className="btn btn-primary" onClick={reset}>Clear filters</button>} />
      ) : (
        <>
          <div className="grid">{data.asks.map((a) => <AskCard key={a.id ?? a._id} ask={a} />)}</div>
          <nav className="pagination" aria-label="Pagination">
            <button className="btn" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            <span>Page {data.page} of {data.pages || 1}</span>
            <button className="btn" disabled={data.page >= data.pages} onClick={() => setPage((p) => p + 1)}>Next</button>
          </nav>
        </>
      )}
    </>
  );
}
