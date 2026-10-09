const CLS = { pending: "pill-warning", accepted: "pill-success", declined: "pill-danger" };
export default function StatusBadge({ status }) {
  return <span className={`pill ${CLS[status] || "pill-muted"}`}>{status}</span>;
}
