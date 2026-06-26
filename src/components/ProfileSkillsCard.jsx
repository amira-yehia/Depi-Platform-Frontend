import "./ProfileSkillsCard.css";

const LEVEL_LABEL = {
  0: "Beginner",
  1: "Intermediate",
  2: "Advanced",
  3: "Expert",
};

export default function ProfileSkillsCard({ skills }) {
  console.log("ProfileSkillsCard:", skills);
  return (
    <section
      className="pscills"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <h2 className="pscills__title">{skills.title}</h2>
      <div className="pscills__sub">{skills.subtitle}</div>

      <div
        className="pscills__chips"
        style={{ marginTop: "16px", flexGrow: 1 }}
      >
        {(!skills.chips || skills.chips.length === 0) && (
          <p style={{ color: "#888", fontSize: "0.875rem" }}>
            No skills added yet.
          </p>
        )}
        {(skills.chips || []).map((c) => (
          <span
            key={c.id || c.name}
            className="pscills__chip"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            {c.name || c.nameEn}

            {(c.level !== undefined || c.years !== undefined) && (
              <span
                style={{
                  fontSize: "0.7rem",
                  opacity: 0.7,
                  marginLeft: "6px",
                }}
              >
                {c.level !== undefined &&
                  `• ${LEVEL_LABEL[c.level] || c.level}`}
                {c.years !== undefined &&
                  ` • ${c.years} year${c.years > 1 ? "s" : ""}`}
              </span>
            )}
            {skills.onDelete && (
              <button
                type="button"
                onClick={() => skills.onDelete(c)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#f87171",
                  cursor: "pointer",
                  padding: "0 2px",
                  fontSize: "0.75rem",
                  lineHeight: 1,
                }}
                aria-label={`Remove ${c.name}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "flex-end",
          marginTop: "24px",
        }}
      >
        <button
          onClick={skills.onAdd}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.9rem",
            padding: "8px 16px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.22)",
            background: "rgba(255,255,255,0.08)",
            color: "#fff",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
          Add Skill
        </button>
      </div>
    </section>
  );
}
