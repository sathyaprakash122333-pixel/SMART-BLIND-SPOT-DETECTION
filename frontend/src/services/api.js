import axios from "axios";

// Replace this with your laptop local IP if the frontend is opened
// from another device on the same Wi-Fi network.
// Example: http://192.168.1.20:8000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export async function fetchDashboardBundle() {
  const [latestResponse, summaryResponse, chartsResponse, eventsResponse, healthResponse] =
    await Promise.all([
      api.get("/api/latest"),
      api.get("/api/analytics/summary"),
      api.get("/api/analytics/charts"),
      api.get("/api/events?limit=12"),
      api.get("/api/health"),
    ]);

  return {
    latest: latestResponse.data,
    summary: summaryResponse.data,
    charts: chartsResponse.data,
    events: eventsResponse.data,
    health: healthResponse.data,
  };
}

export async function postTelemetry(payload) {
  const response = await api.post("/api/ingest", payload);
  return response.data;
}

export { API_BASE_URL };
