import json
from pathlib import Path
from typing import Any

from app.utils.config import EVENTS_FILE


def _ensure_json_file(file_path: Path, default_value: Any) -> None:
    file_path.parent.mkdir(parents=True, exist_ok=True)

    if not file_path.exists():
        file_path.write_text(json.dumps(default_value, indent=2), encoding="utf-8")


def read_events() -> list[dict]:
    _ensure_json_file(EVENTS_FILE, [])

    try:
        return json.loads(EVENTS_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        # If the file becomes corrupted during manual editing,
        # fall back to an empty list instead of crashing the API.
        return []


def write_events(events: list[dict]) -> None:
    _ensure_json_file(EVENTS_FILE, [])
    EVENTS_FILE.write_text(json.dumps(events, indent=2), encoding="utf-8")


def append_event(event: dict) -> dict:
    events = read_events()
    events.append(event)
    write_events(events)
    return event
