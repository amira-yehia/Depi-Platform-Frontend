import "./ProfileScoreCard.css";

export default function ProfileScoreCard({ card }) {
  return (
    <section className="psc">
      <div className="psc__top">
        <i className="fas fa-wand-magic-sparkles" aria-hidden="true" />
        <span>{card.headerText}</span>
      </div>

      <div className="psc__center">
        <div className="psc__percent">{card.percent}%</div>
        <div className="psc__label">{card.label}</div>
      </div>

      <div className="psc__small">{card.topText}</div>

      <div className="psc__bars">
        {card.bars.map((b) => (
          <div className="psc__barRow" key={b.title}>
            <div className="psc__barLeft">
              <span className="psc__barIcon">
                <i className={b.icon} aria-hidden="true" />
              </span>
              <span className="psc__barTitle">{b.title}</span>
            </div>

            <div className="psc__barRight">{b.value}%</div>

            <div className="psc__track">
              <div className="psc__fill" style={{ width: `${b.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}