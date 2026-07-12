from uuid import uuid4

from app.utils.config import (
    DANGER_DISTANCE_CM,
    SYSTEM_ONLINE_TIMEOUT_SECONDS,
    WARNING_DISTANCE_CM,
)
from app.utils.time_utils import parse_timestamp, seconds_since


def clamp(value: float, minimum: float, maximum: float) -> float:
    return max(minimum, min(value, maximum))


def get_distance_level(distance_cm: float) -> str:
    if distance_cm < DANGER_DISTANCE_CM:
        return "danger"
    if distance_cm < WARNING_DISTANCE_CM:
        return "warning"
    return "safe"


def calculate_side_cautious_score(distance_level: str, switch_on: bool) -> float:
    """
    Score formula used for demo analytics:

    - Start with a base score decided by ultrasonic severity.
    - Add a strong bonus if the correct indicator is used during danger.
    - Apply a strong penalty if danger happens without the indicator.
    - Keep the score high when the zone is safe and the switch is not used unnecessarily.
    """

    base_score = {
        "safe": 85,
        "warning": 65,
        "danger": 40,
    }[distance_level]

    if distance_level == "danger" and switch_on:
        indicator_adjustment = 50
    elif distance_level == "danger" and not switch_on:
        indicator_adjustment = -20
    elif distance_level == "warning" and switch_on:
        indicator_adjustment = 25
    elif distance_level == "warning" and not switch_on:
        indicator_adjustment = 5
    elif distance_level == "safe" and switch_on:
        indicator_adjustment = -5
    else:
        indicator_adjustment = 5

    return round(clamp(base_score + indicator_adjustment, 0, 100), 2)


def build_interpreted_state(
    left_danger: bool,
    right_danger: bool,
    left_switch: bool,
    right_switch: bool,
    buzzer_active: bool,
) -> str:
    messages: list[str] = []

    if left_danger and right_danger:
        messages.append("Vehicles detected in both blind spots")
    elif left_danger:
        messages.append("Vehicle detected in left blind spot")
    elif right_danger:
        messages.append("Vehicle detected in right blind spot")
    else:
        messages.append("No immediate blind spot risk")

    if left_danger:
        messages.append("left indicator used correctly" if left_switch else "left indicator missing")

    if right_danger:
        messages.append(
            "right indicator used correctly" if right_switch else "right indicator missing"
        )

    if buzzer_active:
        messages.append("buzzer and vibration alert active")

    return " | ".join(messages)


def is_system_online(timestamp: str | None) -> bool:
    return seconds_since(timestamp) <= SYSTEM_ONLINE_TIMEOUT_SECONDS


def normalize_event(raw_event: dict) -> dict:
    left_distance = round(float(raw_event.get("leftDistance", 0.0)), 2)
    right_distance = round(float(raw_event.get("rightDistance", 0.0)), 2)
    left_switch = bool(raw_event.get("leftSwitch", False))
    right_switch = bool(raw_event.get("rightSwitch", False))
    timestamp = parse_timestamp(raw_event.get("timestamp")).isoformat()

    left_level = get_distance_level(left_distance)
    right_level = get_distance_level(right_distance)
    left_danger = left_level == "danger"
    right_danger = right_level == "danger"
    both_side_danger = left_danger and right_danger
    buzzer_active = (left_danger and left_switch) or (right_danger and right_switch)
    vibration_active = buzzer_active

    left_cautious_score = calculate_side_cautious_score(left_level, left_switch)
    right_cautious_score = calculate_side_cautious_score(right_level, right_switch)
    overall_cautious_score = round(
        (left_cautious_score + right_cautious_score) / 2,
        2,
    )

    interpreted_state = build_interpreted_state(
        left_danger=left_danger,
        right_danger=right_danger,
        left_switch=left_switch,
        right_switch=right_switch,
        buzzer_active=buzzer_active,
    )

    return {
        "id": raw_event.get("id") or f"evt-{uuid4().hex[:10]}",
        "timestamp": timestamp,
        "leftDistance": left_distance,
        "rightDistance": right_distance,
        "leftSwitch": left_switch,
        "rightSwitch": right_switch,
        "leftLevel": left_level,
        "rightLevel": right_level,
        "leftDanger": left_danger,
        "rightDanger": right_danger,
        "bothSideDanger": both_side_danger,
        "buzzerActive": buzzer_active,
        "vibrationActive": vibration_active,
        "leftCautiousScore": left_cautious_score,
        "rightCautiousScore": right_cautious_score,
        "overallCautiousScore": overall_cautious_score,
        "interpretedState": interpreted_state,
    }
