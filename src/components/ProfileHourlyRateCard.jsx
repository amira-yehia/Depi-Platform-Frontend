import "./ProfileHourlyRateCard.css";

export default function ProfileHourlyRateCard({ card }) {
  return (
    <section className="phr">
      <div className="phr__row">
        <div>
          <div className="phr__label">HOURLY RATE</div>
          <div className="phr__rate">
            <span className="phr__currency">$</span>
            {card.rate} <span className="phr__per">/ hr</span>
          </div>
        </div>

        <div className="phr__response">
          <div className="phr__smallLabel">Response time</div>
          <div className="phr__smallVal">{card.responseTime}</div>
        </div>
      </div>

      <div className="phr__divider" />

      <div className="phr__meta">
        <div>
          <div className="phr__smallLabel">Member since</div>
          <div className="phr__smallVal">{card.memberSince}</div>
        </div>

        <div>
          <div className="phr__smallLabel">Languages</div>
          <div className="phr__smallVal">{card.languages}</div>
        </div>
      </div>
    </section>
  );
}