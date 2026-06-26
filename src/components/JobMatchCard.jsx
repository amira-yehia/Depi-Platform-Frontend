import "./JobMatchCard.css";

function JobMatchCard({
  title,
  recommended = false,
  score,
  description,
  tags = [],
  meta = [],
  applyLabel = "Apply Now",
}) {
  return (
    <article className="jobCard">
      <div className="jobCard__header">
        <div className="jobCard__titleWrap">
          <div className="jobCard__titleRow">
            <h3 className="jobCard__title">{title}</h3>

            {recommended && (
              <span className="jobCard__recommended">
                <i className="fa-solid fa-star" aria-hidden="true" />
                Recommended
              </span>
            )}
          </div>

          {description && <p className="jobCard__desc">{description}</p>}
        </div>

        {score !== undefined && (
          <div className="jobCard__scorePill" aria-label={`${score}% match`}>
            <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
            <span>{score}% match</span>
          </div>
        )}
      </div>

      {tags.length > 0 && (
        <div className="jobCard__tags">
          {tags.map((tag) => (
            <span key={tag} className="jobCard__tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="jobCard__bottom">
        <div className="jobCard__meta">
          {meta.map((item, index) => (
            <div className="jobCard__metaItem" key={`${item.text}-${index}`}>
              {item.icon && <i className={item.icon} aria-hidden="true" />}
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <button type="button" className="jobCard__btn">
          {applyLabel}
        </button>
      </div>
    </article>
  );
}

export default JobMatchCard;