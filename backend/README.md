# Smart Blind Spot Detection Backend

This backend is built with FastAPI and stores telemetry data in local JSON files so it stays beginner-friendly and easy to demo in a college mini project.

## Features

- Accepts ESP32 JSON telemetry on `POST /api/ingest`
- Stores readings in `backend/data/events.json`
- Calculates danger states, buzzer logic, cautious scores, and traffic analytics
- Exposes frontend-ready APIs for latest status, charts, summary, and event history
- Enables CORS for the local React frontend

## Folder Structure

```text
backend/
  app/
    main.py
    routes/
    services/
    models/
    utils/
  data/
    events.json
  requirements.txt
  run.py
```

## How To Run

1. Open Command Prompt or PowerShell.
2. Move into the backend folder:

```bash
cd backend
```

3. Create a virtual environment if you want:

```bash
python -m venv .venv
.venv\Scripts\activate
```

4. Install packages:

```bash
pip install -r requirements.txt
```

5. Start the API server:

```bash
python run.py
```

The API will start at:

`http://127.0.0.1:8000`

Swagger API docs:

`http://127.0.0.1:8000/docs`

## ESP32 Integration

Your ESP32 should send JSON like this to:

`http://YOUR_LAPTOP_LOCAL_IP:8000/api/ingest`

Example payload:

```json
{
  "leftDistance": 171.38,
  "rightDistance": 176.40,
  "leftSwitch": true,
  "rightSwitch": true,
  "timestamp": "2026-04-06T10:30:00"
}
```

Replace `YOUR_LAPTOP_LOCAL_IP` with your laptop's local Wi-Fi IP address such as `192.168.1.20`.

## API Endpoints

- `POST /api/ingest`
- `GET /api/latest`
- `GET /api/events`
- `GET /api/analytics/summary`
- `GET /api/analytics/charts`
- `GET /api/health`

## Interpretation Logic

The backend uses these rules:

- `leftDanger = leftDistance < 70 cm`
- `rightDanger = rightDistance < 70 cm`
- `bothSideDanger = leftDanger and rightDanger`
- `buzzerActive = (leftDanger and leftSwitch) or (rightDanger and rightSwitch)`
- `vibrationActive` follows the same alert logic as the buzzer

## Vehicle Crossing Logic

A vehicle crossing is counted only when a side changes like this:

`safe -> danger -> safe`

This debouncing logic prevents one nearby vehicle from being counted multiple times while it remains in the blind spot area.

## Traffic Percentage Formula

The summary endpoint calculates traffic share like this:

- `leftTrafficPercent = leftVehicleCount / totalVehicleCount * 100`
- `rightTrafficPercent = rightVehicleCount / totalVehicleCount * 100`

If no vehicles have been counted yet, both percentages stay at `0`.

## Driver Cautious Score Formula

Each reading produces a left and right cautious score from `0` to `100`.

The score uses:

- ultrasonic distance severity
- whether the correct indicator switch was turned on
- whether the driver reacted properly during danger or warning moments

Current scoring idea in code:

- safe distance with indicator off keeps the score high
- danger with correct indicator keeps the score high
- danger without correct indicator drops the score sharply
- warning with indicator on gets a positive bonus

The summary uses a rolling average of the latest readings to calculate:

- `leftCautiousPercent`
- `rightCautiousPercent`
- `overallCautiousPercent`

## Notes

- Data is stored in JSON for simplicity, not in a database.
- You can clear `backend/data/events.json` any time to reset demo data.
- The seeded sample data helps the frontend show charts immediately during development.
