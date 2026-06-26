import "./ProfileTabs.css";

export default function ProfileTabs({ tabs, active }) {
  return (
    <nav className="ptTabs">
      {tabs.map((t) => (
        <button
          key={t.label}
          type="button"
          className={`ptTab ${active === t.label ? "is-active" : ""}`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}