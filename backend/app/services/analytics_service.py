from collections import OrderedDict

from app.services.telemetry_service import list_normalized_events
from app.utils.config import (
    CHART_BUCKET_MINUTES,
    DANGER_DISTANCE_CM,
    RECENT_EVENTS_LIMIT,
    ROLLING_SCORE_WINDOW,
    WARNING_DISTANCE_CM,
)
from app.utils.time_utils import bucket_start, format_bucket_label, parse_timestamp


def _average(values: list[float]) -> float:
    return round(sum(values) / len(values), 2) if values else 0.0


def _percent(value: float, total: float) -> float:
    return round((value / total) * 100, 2) if total else 0.0


def _extract_crossing_events(events: list[dict], side: str) -> list[dict]:
    """
    Count a vehicle only after a full safe -> danger -> safe cycle.
    This acts as a simple debounce so repeated danger readings do not
    count the same nearby vehicle multiple times.
    """

    danger_key = f"{side}Danger"
    state = "safe"
    entered_at = None
    crossings: list[dict] = []

    for event in events:
        is_danger = bool(event[danger_key])

        if state == "safe" and is_danger:
            state = "danger"
            entered_at = event["timestamp"]
        elif state == "danger" and not is_danger:
            crossings.append(
                {
                    "side": side,
                    "startedAt": entered_at,
                    "completedAt": event["timestamp"],
                }
            )
            state = "safe"
            entered_at = None

    return crossings


def _build_bucket_map(events: list[dict]) -> OrderedDict:
    buckets: OrderedDict = OrderedDict()

    for event in events:
        start = bucket_start(parse_timestamp(event["timestamp"]), CHART_BUCKET_MINUTES)
        bucket_key = start.isoformat()

        if bucket_key not in buckets:
            buckets[bucket_key] = {
                "time": format_bucket_label(start),
                "leftCount": 0,
                "rightCount": 0,
                "leftPercent": 0.0,
                "rightPercent": 0.0,
                "totalVehicles": 0,
                "leftScoreSamples": [],
                "rightScoreSamples": [],
                "overallScoreSamples": [],
            }

        buckets[bucket_key]["leftScoreSamples"].append(event["leftCautiousScore"])
        buckets[bucket_key]["rightScoreSamples"].append(event["rightCautiousScore"])
        buckets[bucket_key]["overallScoreSamples"].append(event["overallCautiousScore"])

    return buckets


def _build_summary(events: list[dict]) -> dict:
    left_crossings = _extract_crossing_events(events, "left")
    right_crossings = _extract_crossing_events(events, "right")
    total_vehicle_count = len(left_crossings) + len(right_crossings)
    rolling_events = events[-ROLLING_SCORE_WINDOW:] if events else []
    latest_event = events[-1] if events else None

    left_scores = [event["leftCautiousScore"] for event in rolling_events]
    right_scores = [event["rightCautiousScore"] for event in rolling_events]
    overall_scores = [event["overallCautiousScore"] for event in rolling_events]

    return {
        "thresholdCm": DANGER_DISTANCE_CM,
        "warningThresholdCm": WARNING_DISTANCE_CM,
        "totalReadings": len(events),
        "leftVehicleCount": len(left_crossings),
        "rightVehicleCount": len(right_crossings),
        "totalVehicleCount": total_vehicle_count,
        "trafficDistribution": {
            "leftPercent": _percent(len(left_crossings), total_vehicle_count),
            "rightPercent": _percent(len(right_crossings), total_vehicle_count),
        },
        "cautiousScores": {
            "leftCautiousPercent": _average(left_scores),
            "rightCautiousPercent": _average(right_scores),
            "overallCautiousPercent": _average(overall_scores),
        },
        "indicatorUsage": {
            "leftCorrectSignalMoments": sum(
                1 for event in events if event["leftDanger"] and event["leftSwitch"]
            ),
            "rightCorrectSignalMoments": sum(
                1 for event in events if event["rightDanger"] and event["rightSwitch"]
            ),
            "missedSignalMoments": sum(
                1
                for event in events
                if (event["leftDanger"] and not event["leftSwitch"])
                or (event["rightDanger"] and not event["rightSwitch"])
            ),
        },
        "rollingWindowSize": len(rolling_events),
        "lastUpdated": latest_event["timestamp"] if latest_event else None,
    }


def get_summary_payload() -> dict:
    events = list_normalized_events()
    return _build_summary(events)


def get_chart_payload() -> dict:
    events = list_normalized_events()
    left_crossings = _extract_crossing_events(events, "left")
    right_crossings = _extract_crossing_events(events, "right")
    buckets = _build_bucket_map(events)

    for crossing in left_crossings:
        start = bucket_start(parse_timestamp(crossing["completedAt"]), CHART_BUCKET_MINUTES)
        bucket_key = start.isoformat()
        if bucket_key in buckets:
            buckets[bucket_key]["leftCount"] += 1

    for crossing in right_crossings:
        start = bucket_start(parse_timestamp(crossing["completedAt"]), CHART_BUCKET_MINUTES)
        bucket_key = start.isoformat()
        if bucket_key in buckets:
            buckets[bucket_key]["rightCount"] += 1

    traffic_percentage_over_time = []
    cautious_score_over_time = []

    for bucket in buckets.values():
        total_vehicles = bucket["leftCount"] + bucket["rightCount"]
        bucket["leftPercent"] = _percent(bucket["leftCount"], total_vehicles)
        bucket["rightPercent"] = _percent(bucket["rightCount"], total_vehicles)
        bucket["totalVehicles"] = total_vehicles

        traffic_percentage_over_time.append(
            {
                "time": bucket["time"],
                "leftPercent": bucket["leftPercent"],
                "rightPercent": bucket["rightPercent"],
                "totalVehicles": total_vehicles,
            }
        )

        cautious_score_over_time.append(
            {
                "time": bucket["time"],
                "leftCautiousPercent": _average(bucket["leftScoreSamples"]),
                "rightCautiousPercent": _average(bucket["rightScoreSamples"]),
                "overallCautiousPercent": _average(bucket["overallScoreSamples"]),
            }
        )

    recent_events = list(reversed(events[-RECENT_EVENTS_LIMIT:]))

    return {
        "vehicleCountComparison": [
            {"side": "Left", "count": len(left_crossings)},
            {"side": "Right", "count": len(right_crossings)},
        ],
        "trafficPercentageOverTime": traffic_percentage_over_time,
        "cautiousScoreOverTime": cautious_score_over_time,
        "recentTrendSampleSize": len(recent_events),
    }
