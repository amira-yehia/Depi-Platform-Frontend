import ReusableCard from "./ReusableCard";
import "./StatsCard.css";

function StatsCard({
  title,
  value,
  subtitle,
  icon = null,
  trend = null,
  extra = null,
}) {
  const hasProgress = extra?.type === "progress";
  const progressValue = Math.min(Math.max(Number(extra?.value) || 0, 0), 100);

  return (
    <ReusableCard className="statsCard" variant="dark">
      {/* Icon can be passed as a Font Awesome class string */}
      {icon && (
        <div className="statsCard__icon">
          <i className={icon} aria-hidden="true" />
        </div>
      )}

      <h4 className="statsCard__title">{title}</h4>
      <div className="statsCard__value">{value}</div>

      {hasProgress && (
        <div className="statsCard__progress" aria-label={`${progressValue}% completed`}>
          <div className="statsCard__progressTrack">
            <span
              className="statsCard__progressFill"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      )}

      {subtitle && <p className="statsCard__subtitle">{subtitle}</p>}

      {trend && (
        <div className={`statsCard__trend ${trend.direction}`}>
          <i
            className={
              trend.direction === "up"
                ? "fa-solid fa-arrow-trend-up"
                : "fa-solid fa-arrow-trend-down"
            }
            aria-hidden="true"
          />
          <span>{trend.value}</span>
        </div>
      )}
    </ReusableCard>
  );
}

export default StatsCard;