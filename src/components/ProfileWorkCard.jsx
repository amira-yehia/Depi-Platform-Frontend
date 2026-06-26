import "./ProfileWorkCard.css";

export default function ProfileWorkCard({ item }) {
  return (
    <article className="pwork">
      <div className="pwork__imgWrap">
        <img className="pwork__img" src={item.imageUrl} alt={item.title} />
        <span className="pwork__pill">{item.pillLabel}</span>
      </div>

      <div className="pwork__body">
        <div className="pwork__titleRow">
          <h3 className="pwork__title">{item.title}</h3>
          <i className="fas fa-arrow-right pwork__arrow" aria-hidden="true" />
        </div>

        <p className="pwork__desc">{item.description}</p>

        <div className="pwork__tags">
          {item.tags.map((t) => (
            <span key={t} className="pwork__tag">{t}</span>
          ))}
        </div>
      </div>
    </article>
  );
}