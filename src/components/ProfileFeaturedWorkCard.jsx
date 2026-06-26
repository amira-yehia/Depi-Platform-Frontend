import "./ProfileFeaturedWorkCard.css";
import ProfileWorkCard from "./ProfileWorkCard";

export default function ProfileFeaturedWorkCard({ work }) {
  return (
    <section className="pworkShell">
      <div className="pworkShell__head">
        <div>
          <h2 className="pworkShell__title">{work.title}</h2>
          <div className="pworkShell__sub">{work.subtitle}</div>
        </div>

        <div className="pworkShell__right">{work.rightLinkText}</div>
      </div>

      <div className="pworkShell__grid">
        {work.items.map((it) => (
          <ProfileWorkCard key={it.title} item={it} />
        ))}
      </div>
    </section>
  );
}