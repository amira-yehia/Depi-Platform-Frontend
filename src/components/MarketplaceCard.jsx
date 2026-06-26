import "./MarketplaceCard.css";

function MarketplaceCard({
  title,
  recommended = false,
  score,
  scoreLabel = "MATCH",
  description,
  tags = [],
  meta = [], // [{ icon: "fas fa-...", text: "..." }, ...]
  applyLabel = "Apply Now",
}) {
  return (
    <article className="mcard">
      <div className="mcard__top">
        <div className="mcard__titleWrap">
          <div className="mcard__titleRow">
            <h3 className="mcard__title">{title}</h3>

            {recommended && (
              <span className="mcard__badge">
                <i className="fas fa-star" aria-hidden="true" />
                Recommended
              </span>
            )}
          </div>
        </div>

        <div className="mcard__scorePill" aria-label={`${score} ${scoreLabel}`}>
          <div className="mcard__score">{score}</div>
          <div className="mcard__scoreLabel">{scoreLabel}</div>
        </div>
      </div>

      <p className="mcard__desc">{description}</p>

      {tags.length > 0 && (
        <div className="mcard__tags">
          {tags.map((t) => (
            <span key={t} className="mcard__tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mcard__footer">
        <div className="mcard__meta">
          {meta.map((m, idx) => (
            <div key={idx} className="mcard__metaItem">
              {m.icon && <i className={m.icon} aria-hidden="true" />}
              <span>{m.text}</span>
            </div>
          ))}
        </div>

        <button className="mcard__btn" type="button">
          {applyLabel}
        </button>
      </div>
    </article>
  );
}

export default MarketplaceCard;