from app.models.schemas import TelemetryIngestPayload
from app.services.storage_service import append_event, read_events
from app.utils.interpretation import is_system_online, normalize_event


def list_normalized_events() -> list[dict]:
    events = [normalize_event(event) for event in read_events()]
    events.sort(key=lambda item: item["timestamp"])
    return events


def ingest_event(payload: TelemetryIngestPayload) -> dict:
    normalized_event = normalize_event(payload.model_dump())
    append_event(normalized_event)
    return normalized_event


def get_latest_snapshot() -> dict:
    events = list_normalized_events()
    latest_event = events[-1] if events else None

    return {
        "online": bool(latest_event and is_system_online(latest_event["timestamp"])),
        "lastUpdated": latest_event["timestamp"] if latest_event else None,
        "totalReadings": len(events),
        "event": latest_event,
    }


def get_recent_events(limit: int) -> list[dict]:
    events = list_normalized_events()
    return list(reversed(events[-limit:]))


def get_health_payload() -> dict:
    latest = get_latest_snapshot()
    return {
        "status": "ok",
        "service": "smart-blindspot-backend",
        "online": latest["online"],
        "lastUpdated": latest["lastUpdated"],
        "totalReadings": latest["totalReadings"],
    }
