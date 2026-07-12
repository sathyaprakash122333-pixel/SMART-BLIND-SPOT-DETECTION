export function formatDistance(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${numericValue.toFixed(1)} cm` : "--";
}

export function formatTimestamp(value) {
  if (!value) {
    return "No data yet";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(date);
}

export function formatPercent(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${numericValue.toFixed(1)}%` : "0.0%";
}

export function formatSwitch(value) {
  return value ? "ON" : "OFF";
}

export function formatBooleanStatus(value, activeLabel = "Active", inactiveLabel = "Inactive") {
  return value ? activeLabel : inactiveLabel;
}
