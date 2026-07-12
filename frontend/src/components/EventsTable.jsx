import { formatDistance, formatSwitch, formatTimestamp } from "../utils/formatters";
import StatusPill from "./StatusPill";

function EventsTable({ events }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>Recent Event History</h2>
          <p>Latest readings with interpreted blind-spot state for your project demo.</p>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="events-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Left Distance</th>
              <th>Right Distance</th>
              <th>Left Switch</th>
              <th>Right Switch</th>
              <th>Alert</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan="7" className="events-table__empty">
                  No events available yet.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id}>
                  <td>{formatTimestamp(event.timestamp)}</td>
                  <td>{formatDistance(event.leftDistance)}</td>
                  <td>{formatDistance(event.rightDistance)}</td>
                  <td>
                    <StatusPill
                      label={formatSwitch(event.leftSwitch)}
                      tone={event.leftSwitch ? "info" : "muted"}
                    />
                  </td>
                  <td>
                    <StatusPill
                      label={formatSwitch(event.rightSwitch)}
                      tone={event.rightSwitch ? "info" : "muted"}
                    />
                  </td>
                  <td>
                    <StatusPill
                      label={
                        event.bothSideDanger
                          ? "BOTH"
                          : event.leftDanger
                            ? "LEFT"
                            : event.rightDanger
                              ? "RIGHT"
                              : "SAFE"
                      }
                      tone={
                        event.bothSideDanger
                          ? "danger"
                          : event.leftDanger || event.rightDanger
                            ? "warning"
                            : "safe"
                      }
                    />
                  </td>
                  <td>{event.interpretedState}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default EventsTable;
