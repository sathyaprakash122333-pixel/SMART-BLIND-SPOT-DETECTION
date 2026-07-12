export function getDistanceTone(level) {
  if (level === "danger") {
    return "danger";
  }

  if (level === "warning") {
    return "warning";
  }

  return "safe";
}

export function getBinaryTone(value, activeTone = "danger", inactiveTone = "safe") {
  return value ? activeTone : inactiveTone;
}

export function getSwitchTone(value) {
  return value ? "info" : "muted";
}

export function getScoreTone(score) {
  if (score >= 85) {
    return "safe";
  }

  if (score >= 65) {
    return "warning";
  }

  return "danger";
}

export function getOnlineTone(value) {
  return value ? "safe" : "danger";
}
