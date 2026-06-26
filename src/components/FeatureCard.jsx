import "./FeatureCard.css";

function FeatureCard({ icon, title, children }) {
  return (
    <article className="featureCard">
      {/* Feature icon */}
      {icon && (
        <div className="featureCard__icon">
          <i className={icon} aria-hidden="true" />
        </div>
      )}

      {title && <h3 className="featureCard__title">{title}</h3>}

      <p className="featureCard__description">{children}</p>
    </article>
  );
}

export default FeatureCard;