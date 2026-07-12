# Smart Blind Spot Detection Frontend

This frontend is a React + Vite dark dashboard for the project:

**Smart Blind Spot Detection System using ESP32 with IoT Integration**

## Features

- Dark-mode professional dashboard
- Live polling every 2 seconds
- KPI cards for live distances, switches, danger states, buzzer, and connection state
- Recharts visualizations for vehicle counts, traffic share, and cautious score trends
- Recent events table with interpreted states
- Beginner-friendly project structure with reusable components

## Folder Structure

```text
frontend/
  public/
  src/
    assets/
    components/
    data/
    pages/
    services/
    utils/
    App.jsx
    main.jsx
    index.css
    theme.css
  package.json
  vite.config.js
  README.md
```

## How To Run

1. Open VS Code terminal.
2. Move into the frontend folder:

```bash
cd frontend
```

3. Install packages:

```bash
npm install
```

4. Start development server:

```bash
npm run dev
```

5. Open the shown Vite URL in your browser.

Normally it will be:

`http://127.0.0.1:5173`

## Backend Connection

The frontend reads the backend URL from:

- `VITE_API_BASE_URL` environment variable, or
- fallback default `http://127.0.0.1:8000`

You can create a `.env` file inside `frontend` if needed:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

If you open the dashboard from another device on the same Wi-Fi, replace that IP with your laptop local IP.

## UI Sections

- top header
- live telemetry cards
- analytics KPI cards
- charts section
- cautious score section
- recent events table

## Traffic Percentage Formula

The dashboard uses the backend summary values:

- `leftTrafficPercent = leftVehicleCount / totalVehicleCount * 100`
- `rightTrafficPercent = rightVehicleCount / totalVehicleCount * 100`

## Driver Cautious Score Formula

Each reading gets a score from the backend using:

- ultrasonic severity
- indicator switch usage
- correct behavior during danger moments

The dashboard shows the rolling average from the backend for:

- left cautious score
- right cautious score
- overall cautious score

## Notes

- `src/data/mockDashboard.json` gives example data for development and demos.
- When the backend is unavailable, the UI keeps the last available snapshot so the screen does not go blank.
