export default function Toast({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.message}</span>
          <button type="button" aria-label="Dismiss" onClick={() => onDismiss(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
