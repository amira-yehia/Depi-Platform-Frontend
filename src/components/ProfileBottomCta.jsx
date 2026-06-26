import "./ProfileBottomCta.css";

export default function ProfileBottomCta({ cta }) {
  return (
    <div className="pBottom">
      <div className="pBottom__left">
        <div className="pBottom__avatar">
          <i className="fas fa-user" aria-hidden="true" />
        </div>
        <div>
          <div className="pBottom__title">{cta.title}</div>
          <div className="pBottom__sub">{cta.subtitle}</div>
        </div>
      </div>

      <button className="pBottom__btn" type="button">
        <i className="fas fa-briefcase" aria-hidden="true" /> {cta.buttonText}
      </button>
    </div>
  );
}