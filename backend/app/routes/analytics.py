from fastapi import APIRouter

from app.services.analytics_service import get_chart_payload, get_summary_payload


router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/summary")
def analytics_summary() -> dict:
    return get_summary_payload()


@router.get("/charts")
def analytics_charts() -> dict:
    return get_chart_payload()
