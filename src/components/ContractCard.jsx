import "./ContractCard.css";

function ContractCard({
  title,
  company,
  progress = 0,
  earnings,
  contractType = "Fixed",
}) {
  const safeProgress = Math.min(Math.max(Number(progress) || 0, 0), 100);

  return (
    <article className="contractCard">
      <div className="contractCard__header">
        <h4 className="contractCard__title">{title}</h4>
        <span className="contractCard__type">{contractType}</span>
      </div>

      <p className="contractCard__company">{company}</p>

      <div className="contractCard__progress">
        <div className="contractCard__progressTop">
          <span>Progress</span>
          <strong>{safeProgress}%</strong>
        </div>

        <div className="contractCard__progressBar">
          <span
            className="contractCard__progressFill"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>

      <div className="contractCard__earnings">
        <span>Earnings</span>
        <strong>{earnings}</strong>
      </div>
    </article>
  );
}

export default ContractCard;