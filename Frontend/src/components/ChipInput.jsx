import { useState } from "react";
import Field from "./Field";

export default function ChipInput({ label, items, onChange, placeholder, error }) {
  const [draft, setDraft] = useState("");

  function add() {
    const v = draft.trim();
    if (v && !items.includes(v)) onChange([...items, v]);
    setDraft("");
  }

  return (
    <Field label={label} error={error}>
      <div>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <input
            value={draft}
            placeholder={placeholder}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          />
          <button type="button" className="btn" onClick={add}>Add</button>
        </div>
        {items.length > 0 && (
          <div className="chips">
            {items.map((it) => (
              <span className="chip" key={it}>
                {it}
                <button type="button" aria-label={`Remove ${it}`} onClick={() => onChange(items.filter((x) => x !== it))}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>
    </Field>
  );
}
