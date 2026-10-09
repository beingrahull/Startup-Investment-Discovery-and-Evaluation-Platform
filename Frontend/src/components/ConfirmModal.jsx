import { useEffect } from "react";

export default function ConfirmModal({ open, title, children, confirmLabel = "Confirm", cancelLabel = "Cancel", onConfirm, onCancel, busy = false, danger = false }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !busy) onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        {children}
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button type="button" className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm} disabled={busy}>
            {busy ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
