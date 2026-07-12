from datetime import datetime


LOCAL_TZ = datetime.now().astimezone().tzinfo


def current_time() -> datetime:
    return datetime.now(tz=LOCAL_TZ)


def parse_timestamp(value: str | None) -> datetime:
    if not value:
        return current_time()

    sanitized = value.strip().replace("Z", "+00:00")
    parsed = datetime.fromisoformat(sanitized)

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=LOCAL_TZ)

    return parsed.astimezone(LOCAL_TZ)


def bucket_start(value: datetime, minutes: int) -> datetime:
    minute_slot = (value.minute // minutes) * minutes
    return value.replace(minute=minute_slot, second=0, microsecond=0)


def format_bucket_label(value: datetime) -> str:
    return value.strftime("%H:%M")


def seconds_since(value: str | None) -> float:
    timestamp = parse_timestamp(value)
    return (current_time() - timestamp).total_seconds()
