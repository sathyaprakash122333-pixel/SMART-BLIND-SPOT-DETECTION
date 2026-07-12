import { formatPercent } from "../utils/formatters";
import { getScoreTone } from "../utils/status";
import StatusPill from "./StatusPill";

function ScoreCard({ title, value, description }) {
  const numericValue = Number(value) || 0;
  const tone = getScoreTone(numericValue);

  return (
    <article className="panel score-card">
      <div className="score-card__header">
        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <StatusPill label={tone.toUpperCase()} tone={tone} />
      </div>

      <div className="score-card__content">
        <div
          className={`score-ring score-ring--${tone}`}
          style={{ "--score": `${numericValue}%` }}
        >
          <div className="score-ring__inner">{formatPercent(numericValue)}</div>
        </div>
      </div>
    </article>
  );
}

export default ScoreCard;
