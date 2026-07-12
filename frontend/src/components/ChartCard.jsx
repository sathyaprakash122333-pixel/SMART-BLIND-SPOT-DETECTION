function ChartCard({ title, subtitle, children }) {
  return (
    <section className="panel chart-card">
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="chart-card__body">{children}</div>
    </section>
  );
}

export default ChartCard;
