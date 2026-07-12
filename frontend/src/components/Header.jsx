import signalGrid from "../assets/signal-grid.svg";
import { formatTimestamp } from "../utils/formatters";
import StatusPill from "./StatusPill";

function Header({ online, lastUpdated, apiBaseUrl, usingMockData }) {
  return (
    <header className="hero-card panel">
      <div className="hero-card__copy">
        <div className="hero-card__eyebrow">
          <StatusPill
            label={online ? "SYSTEM ONLINE" : "SYSTEM OFFLINE"}
            tone={online ? "safe" : "danger"}
          />
          <StatusPill
            label={usingMockData ? "DEMO SNAPSHOT" : "LIVE API"}
            tone={usingMockData ? "warning" : "info"}
          />
        </div>

        <h1>Smart Blind Spot Detection System</h1>
        <p className="hero-card__subtitle">
          ESP32 telemetry dashboard for left and right blind-spot monitoring, danger alerts,
          driver caution analytics, and local IoT visualization.
        </p>

        <div className="hero-card__meta">
          <div>
            <span>Last updated</span>
            <strong>{formatTimestamp(lastUpdated)}</strong>
          </div>
          <div>
            <span>Connected backend</span>
            <strong>{apiBaseUrl}</strong>
          </div>
        </div>
      </div>

      <div className="hero-card__visual">
        <img src={signalGrid} alt="Blind spot telemetry illustration" />
      </div>
    </header>
  );
}

export default Header;
