export default function RoleBadge({ role }) {
  return <span className={`pill ${role === "founder" ? "" : "pill-success"}`}>{role}</span>;
}
