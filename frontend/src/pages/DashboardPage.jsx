import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "../components/ChartCard";
import EventsTable from "../components/EventsTable";
import Header from "../components/Header";
import InfoCard from "../components/InfoCard";
import ScoreCard from "../components/ScoreCard";
import mockDashboard from "../data/mockDashboard.json";
import { API_BASE_URL, fetchDashboardBundle } from "../services/api";
import {
  formatBooleanStatus,
  formatDistance,
  formatPercent,
  formatSwitch,
  formatTimestamp,
} from "../utils/formatters";
import {
  getBinaryTone,
  getDistanceTone,
  getOnlineTone,
  getScoreTone,
  getSwitchTone,
} from "../utils/status";

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(mockDashboard);
  const [loading, setLoading] = useState(true);
  const [usingMockData, setUsingMockData] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const payload = await fetchDashboardBundle();

        if (!isMounted) {
          return;
        }

        setDashboardData(payload);
        setUsingMockData(false);
        setErrorMessage("");
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          "Backend not reachable right now. The dashboard is showing the last available snapshot."
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    const intervalId = window.setInterval(loadDashboard, 2000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const latest = dashboardData.latest?.event ?? {};
  const summary = dashboardData.summary ?? {};
  const charts = dashboardData.charts ?? {};
  const events = dashboardData.events?.items ?? [];
  const health = dashboardData.health ?? {};

  const liveCards = useMemo(
    () => [
      {
        title: "Left Distance",
        value: formatDistance(latest.leftDistance),
        subtitle: "Ultrasonic reading from the left blind spot",
        tone: getDistanceTone(latest.leftLevel),
        badge: (latest.leftLevel || "safe").toUpperCase(),
      },
      {
        title: "Right Distance",
        value: formatDistance(latest.rightDistance),
        subtitle: "Ultrasonic reading from the right blind spot",
        tone: getDistanceTone(latest.rightLevel),
        badge: (latest.rightLevel || "safe").toUpperCase(),
      },
      {
        title: "Left Switch",
        value: formatSwitch(latest.leftSwitch),
        subtitle: "Current left indicator switch state",
        tone: getSwitchTone(latest.leftSwitch),
        badge: formatSwitch(latest.leftSwitch),
      },
      {
        title: "Right Switch",
        value: formatSwitch(latest.rightSwitch),
        subtitle: "Current right indicator switch state",
        tone: getSwitchTone(latest.rightSwitch),
        badge: formatSwitch(latest.rightSwitch),
      },
      {
        title: "Left Danger",
        value: formatBooleanStatus(latest.leftDanger, "Detected", "Clear"),
        subtitle: "True when left distance drops below threshold",
        tone: getBinaryTone(latest.leftDanger),
        badge: latest.leftDanger ? "DANGER" : "SAFE",
      },
      {
        title: "Right Danger",
        value: formatBooleanStatus(latest.rightDanger, "Detected", "Clear"),
        subtitle: "True when right distance drops below threshold",
        tone: getBinaryTone(latest.rightDanger),
        badge: latest.rightDanger ? "DANGER" : "SAFE",
      },
      {
        title: "Both-Side Danger",
        value: formatBooleanStatus(latest.bothSideDanger, "Detected", "No"),
        subtitle: "Active only when both blind spots are dangerous",
        tone: getBinaryTone(latest.bothSideDanger),
        badge: latest.bothSideDanger ? "BOTH" : "NO",
      },
      {
        title: "Buzzer Status",
        value: formatBooleanStatus(latest.buzzerActive, "Active", "Standby"),
        subtitle: "Turns on when indicator and danger logic match",
        tone: getBinaryTone(latest.buzzerActive, "warning"),
        badge: latest.buzzerActive ? "ALERT" : "STANDBY",
      },
      {
        title: "System Status",
        value: dashboardData.latest?.online ? "Online" : "Offline",
        subtitle: "Backend heartbeat based on latest telemetry timestamp",
        tone: getOnlineTone(dashboardData.latest?.online),
        badge: dashboardData.latest?.online ? "LIVE" : "OFFLINE",
      },
      {
        title: "Last Updated",
        value: formatTimestamp(dashboardData.latest?.lastUpdated),
        subtitle: "Most recent reading received from the backend",
        tone: "info",
        badge: "TIME",
      },
    ],
    [dashboardData.latest?.lastUpdated, dashboardData.latest?.online, latest]
  );

  const analyticsCards = [
    {
      title: "Left Cars Crossed",
      value: summary.leftVehicleCount ?? 0,
      subtitle: "Counted with safe → danger → safe debouncing",
      tone: "info",
      badge: "LEFT",
    },
    {
      title: "Right Cars Crossed",
      value: summary.rightVehicleCount ?? 0,
      subtitle: "Counted with safe → danger → safe debouncing",
      tone: "info",
      badge: "RIGHT",
    },
    {
      title: "Left Traffic Share",
      value: formatPercent(summary.trafficDistribution?.leftPercent),
      subtitle: "Left side percentage of counted vehicle crossings",
      tone: "warning",
      badge: "TRAFFIC",
    },
    {
      title: "Right Traffic Share",
      value: formatPercent(summary.trafficDistribution?.rightPercent),
      subtitle: "Right side percentage of counted vehicle crossings",
      tone: "warning",
      badge: "TRAFFIC",
    },
  ];

  return (
    <div className="app-shell">
      <Header
        online={dashboardData.latest?.online}
        lastUpdated={dashboardData.latest?.lastUpdated}
        apiBaseUrl={API_BASE_URL}
        usingMockData={usingMockData}
      />

      {errorMessage ? <div className="alert-banner">{errorMessage}</div> : null}
      {loading ? <div className="alert-banner alert-banner--info">Loading dashboard...</div> : null}

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Live Monitoring</h2>
            <p>Real-time blind-spot telemetry cards for your hardware demo setup.</p>
          </div>
        </div>
        <div className="card-grid">
          {liveCards.map((card) => (
            <InfoCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Analytics Overview</h2>
            <p>Vehicle crossing counts, traffic share, and backend health at a glance.</p>
          </div>
        </div>
        <div className="card-grid">
          {analyticsCards.map((card) => (
            <InfoCard key={card.title} {...card} />
          ))}
          <InfoCard
            title="Indicator Usage"
            value={`${summary.indicatorUsage?.leftCorrectSignalMoments ?? 0} / ${summary.indicatorUsage?.rightCorrectSignalMoments ?? 0}`}
            subtitle="Correct left/right indicator usage during danger moments"
            tone="safe"
            badge="GOOD USE"
          />
          <InfoCard
            title="Missed Signal Moments"
            value={summary.indicatorUsage?.missedSignalMoments ?? 0}
            subtitle="Danger readings where the matching indicator was not active"
            tone="danger"
            badge="WATCH"
          />
          <InfoCard
            title="Stored Readings"
            value={summary.totalReadings ?? 0}
            subtitle="Telemetry rows currently saved in the JSON data file"
            tone="info"
            badge="DATA"
          />
          <InfoCard
            title="Health Endpoint"
            value={health.status?.toUpperCase() ?? "UNKNOWN"}
            subtitle="Quick backend service check from /api/health"
            tone={health.status === "ok" ? "safe" : "danger"}
            badge={health.online ? "CONNECTED" : "WAITING"}
          />
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Cautious Score Section</h2>
            <p>Driver behavior estimation based on indicator usage, ultrasonic severity, and danger logic.</p>
          </div>
        </div>
        <div className="score-grid">
          <ScoreCard
            title="Left Driver Cautious Score"
            value={summary.cautiousScores?.leftCautiousPercent}
            description="Rolling average using left indicator state plus left ultrasonic severity."
          />
          <ScoreCard
            title="Right Driver Cautious Score"
            value={summary.cautiousScores?.rightCautiousPercent}
            description="Rolling average using right indicator state plus right ultrasonic severity."
          />
          <ScoreCard
            title="Overall Driver Cautious Score"
            value={summary.cautiousScores?.overallCautiousPercent}
            description="Average of the left and right cautious scores for the latest rolling window."
          />
        </div>
      </section>

      <section className="chart-grid">
        <ChartCard
          title="Left vs Right Vehicle Counts"
          subtitle="Bar chart of counted crossings for each blind-spot side."
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={charts.vehicleCountComparison ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 180, 255, 0.12)" />
              <XAxis dataKey="side" stroke="#8aa4c8" />
              <YAxis stroke="#8aa4c8" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: "#0d1624",
                  border: "1px solid rgba(150, 180, 255, 0.12)",
                  borderRadius: "16px",
                }}
              />
              <Bar dataKey="count" fill="#1dd3ff" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Traffic Percentage Over Time"
          subtitle="Time-based share of left and right traffic from counted crossings."
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={charts.trafficPercentageOverTime ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 180, 255, 0.12)" />
              <XAxis dataKey="time" stroke="#8aa4c8" />
              <YAxis stroke="#8aa4c8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "#0d1624",
                  border: "1px solid rgba(150, 180, 255, 0.12)",
                  borderRadius: "16px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="leftPercent"
                name="Left %"
                stroke="#1dd3ff"
                fill="rgba(29, 211, 255, 0.24)"
              />
              <Area
                type="monotone"
                dataKey="rightPercent"
                name="Right %"
                stroke="#4d7cff"
                fill="rgba(77, 124, 255, 0.24)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Driver Cautious Score Over Time"
          subtitle="Trend chart for left, right, and overall cautious percentages."
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={charts.cautiousScoreOverTime ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 180, 255, 0.12)" />
              <XAxis dataKey="time" stroke="#8aa4c8" />
              <YAxis stroke="#8aa4c8" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "#0d1624",
                  border: "1px solid rgba(150, 180, 255, 0.12)",
                  borderRadius: "16px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="leftCautiousPercent"
                name="Left score"
                stroke="#ffd166"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="rightCautiousPercent"
                name="Right score"
                stroke="#4d7cff"
                strokeWidth={3}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="overallCautiousPercent"
                name="Overall score"
                stroke="#2ad49c"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Latest System Interpretation</h2>
            <p>How the backend currently understands the most recent hardware reading.</p>
          </div>
        </div>
        <div className="card-grid card-grid--wide">
          <InfoCard
            title="Current State Message"
            value={latest.interpretedState || "Waiting for telemetry"}
            subtitle="Backend interpretation of danger, indicator, buzzer, and overall situation"
            tone={getScoreTone(latest.overallCautiousScore)}
            badge="STATE"
          />
          <InfoCard
            title="Vibration Motor"
            value={formatBooleanStatus(latest.vibrationActive, "Active", "Standby")}
            subtitle="Mirrors the buzzer logic for haptic alerting"
            tone={getBinaryTone(latest.vibrationActive, "warning")}
            badge={latest.vibrationActive ? "ACTIVE" : "STANDBY"}
          />
        </div>
      </section>

      <EventsTable events={events} />
    </div>
  );
}

export default DashboardPage;
