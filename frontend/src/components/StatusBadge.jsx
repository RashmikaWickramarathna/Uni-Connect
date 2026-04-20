export default function StatusBadge({ status }) {
  const normalized = (status || "").toLowerCase();

  return (
    <span className={`badge badge-${normalized.replace(/\s+/g, "-")}`}>
      {status || "Unknown"}
    </span>
  );
}