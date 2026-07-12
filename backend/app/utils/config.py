from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
EVENTS_FILE = DATA_DIR / "events.json"

# Distance bands used across the project.
DANGER_DISTANCE_CM = 70.0
WARNING_DISTANCE_CM = 120.0

# If the latest telemetry is older than this, the frontend can show the system as offline.
SYSTEM_ONLINE_TIMEOUT_SECONDS = 6

# Rolling analytics settings for summary cards and charts.
ROLLING_SCORE_WINDOW = 30
RECENT_EVENTS_LIMIT = 25
CHART_BUCKET_MINUTES = 1
