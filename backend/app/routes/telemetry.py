from fastapi import APIRouter, Query

from app.models.schemas import TelemetryIngestPayload
from app.services.telemetry_service import (
    get_health_payload,
    get_latest_snapshot,
    get_recent_events,
    ingest_event,
)


router = APIRouter(prefix="/api", tags=["telemetry"])


@router.post("/ingest")
def ingest_telemetry(payload: TelemetryIngestPayload) -> dict:
    stored_event = ingest_event(payload)
    return {
        "message": "Telemetry ingested successfully.",
        "event": stored_event,
    }


@router.get("/latest")
def latest_snapshot() -> dict:
    return get_latest_snapshot()


@router.get("/events")
def list_recent_events(limit: int = Query(default=20, ge=1, le=100)) -> dict:
    items = get_recent_events(limit)
    return {
        "count": len(items),
        "items": items,
    }


@router.get("/health")
def health() -> dict:
    return get_health_payload()
