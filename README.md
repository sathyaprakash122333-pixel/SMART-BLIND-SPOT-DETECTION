Smart Blind Spot Detection Frontend

This frontend is a React + Vite dark dashboard for the project:

Smart Blind Spot Detection System using ESP32 with IoT Integration

Features
Dark-mode professional dashboard
Live polling every 2 seconds
KPI cards for live distances, switches, danger states, buzzer, and connection state
Recharts visualizations for vehicle counts, traffic share, and cautious score trends
Recent events table with interpreted states
Beginner-friendly project structure with reusable components
Folder Structure
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
How To Run
Open VS Code terminal.
Move into the frontend folder:
cd frontend
Install packages:
npm install
Start development server:
npm run dev
Open the shown Vite URL in your browser.
Normally it will be:

http://127.0.0.1:5173

Backend Connection
The frontend reads the backend URL from:

VITE_API_BASE_URL environment variable, or
fallback default http://127.0.0.1:8000
You can create a .env file inside frontend if needed:

VITE_API_BASE_URL=http://127.0.0.1:8000
If you open the dashboard from another device on the same Wi-Fi, replace that IP with your laptop local IP.

UI Sections
top header
live telemetry cards
analytics KPI cards
charts section
cautious score section
recent events table
Traffic Percentage Formula
The dashboard uses the backend summary values:

leftTrafficPercent = leftVehicleCount / totalVehicleCount * 100
rightTrafficPercent = rightVehicleCount / totalVehicleCount * 100
Driver Cautious Score Formula
Each reading gets a score from the backend using:

ultrasonic severity
indicator switch usage
correct behavior during danger moments
The dashboard shows the rolling average from the backend for:

left cautious score
right cautious score
overall cautious score
Notes
src/data/mockDashboard.json gives example data for development and demos.
When the backend is unavailable, the UI keeps the last available snapshot so the screen does not go blank.

Smart Blind Spot Detection Backend
This backend is built with FastAPI and stores telemetry data in local JSON files so it stays beginner-friendly and easy to demo in a college mini project.

Features
Accepts ESP32 JSON telemetry on POST /api/ingest
Stores readings in backend/data/events.json
Calculates danger states, buzzer logic, cautious scores, and traffic analytics
Exposes frontend-ready APIs for latest status, charts, summary, and event history
Enables CORS for the local React frontend
Folder Structure
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
How To Run
Open Command Prompt or PowerShell.
Move into the backend folder:
cd backend
Create a virtual environment if you want:
python -m venv .venv
.venv\Scripts\activate
Install packages:
pip install -r requirements.txt
Start the API server:
python run.py
The API will start at:

http://127.0.0.1:8000

Swagger API docs:

http://127.0.0.1:8000/docs

ESP32 Integration
Your ESP32 should send JSON like this to:

http://YOUR_LAPTOP_LOCAL_IP:8000/api/ingest

Example payload:

{
  "leftDistance": 171.38,
  "rightDistance": 176.40,
  "leftSwitch": true,
  "rightSwitch": true,
  "timestamp": "2026-04-06T10:30:00"
}
Replace YOUR_LAPTOP_LOCAL_IP with your laptop's local Wi-Fi IP address such as 192.168.1.20.

API Endpoints
POST /api/ingest
GET /api/latest
GET /api/events
GET /api/analytics/summary
GET /api/analytics/charts
GET /api/health
Interpretation Logic
The backend uses these rules:

leftDanger = leftDistance < 70 cm
rightDanger = rightDistance < 70 cm
bothSideDanger = leftDanger and rightDanger
buzzerActive = (leftDanger and leftSwitch) or (rightDanger and rightSwitch)
vibrationActive follows the same alert logic as the buzzer
Vehicle Crossing Logic
A vehicle crossing is counted only when a side changes like this:

safe -> danger -> safe

This debouncing logic prevents one nearby vehicle from being counted multiple times while it remains in the blind spot area.

Traffic Percentage Formula
The summary endpoint calculates traffic share like this:

leftTrafficPercent = leftVehicleCount / totalVehicleCount * 100
rightTrafficPercent = rightVehicleCount / totalVehicleCount * 100
If no vehicles have been counted yet, both percentages stay at 0.

Driver Cautious Score Formula
Each reading produces a left and right cautious score from 0 to 100.

The score uses:

ultrasonic distance severity
whether the correct indicator switch was turned on
whether the driver reacted properly during danger or warning moments
Current scoring idea in code:

safe distance with indicator off keeps the score high
danger with correct indicator keeps the score high
danger without correct indicator drops the score sharply
warning with indicator on gets a positive bonus
The summary uses a rolling average of the latest readings to calculate:

leftCautiousPercent
rightCautiousPercent
overallCautiousPercent
Notes
Data is stored in JSON for simplicity, not in a database.
You can clear backend/data/events.json any time to reset demo data.
The seeded sample data helps the frontend show charts immediately during development.
this help to find the blind sport in the vehiche while turnig that help for a safty travel.
reducs the accidents in the turning areas.
alert the owner/driver while turning in a area where there is trafic so the drive can be aware of the near by cars and bikes and travel safely.
