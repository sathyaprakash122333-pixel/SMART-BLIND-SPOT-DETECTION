function StatusPill({ label, tone = "info" }) {
  return <span className={`status-pill status-pill--${tone}`}>{label}</span>;
}

export default StatusPill;
