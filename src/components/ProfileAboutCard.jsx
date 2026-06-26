import "./ProfileAboutCard.css";

export default function ProfileAboutCard({ about }) {
  return (
    <section className="pac">
      <h2 className="pac__title">{about.title}</h2>
      <p className="pac__desc">{about.description}</p>
      <p className="pac__desc2">{about.description2}</p>
    </section>
  );
}