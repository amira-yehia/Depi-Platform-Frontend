import "./ProfileStatsGrid.css";

export default function ProfileStatsGrid({ stats }) {
  return (
    <section className="psStats">
      {stats.map((s) => (
        <div className="psStats__card" key={s.title}>
          <i className={s.icon} aria-hidden="true" />
          <div className="psStats__value">{s.value}</div>
          <div className="psStats__title">{s.title}</div>
          <div className="psStats__sub">{s.sub}</div>
        </div>
      ))}
    </section>
  );
}