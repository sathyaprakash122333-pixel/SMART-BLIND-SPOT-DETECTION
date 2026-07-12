import StatusPill from "./StatusPill";

function InfoCard({ title, value, subtitle, tone = "info", badge }) {
  return (
    <article className={`info-card info-card--${tone}`}>
      <div className="info-card__top">
        <p className="info-card__title">{title}</p>
        {badge ? <StatusPill label={badge} tone={tone} /> : null}
      </div>
      <h3 className="info-card__value">{value}</h3>
      <p className="info-card__subtitle">{subtitle}</p>
    </article>
  );
}

export default InfoCard;
