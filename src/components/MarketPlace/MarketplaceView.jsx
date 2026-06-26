import { useNavigate } from "react-router-dom";
import "./MarketplaceView.css";

export default function MarketplaceView({ header, projects, onOpenProject, onApply, onBookmark, loading }) {
  const navigate = useNavigate();
  const openDetails = (id) => (onOpenProject ? onOpenProject(id) : navigate(`/projects/${id}`));

  return (
    <div className="mp">
      <div className="mp__container">
        <header className="mpHeader">
          <div className="mpHeader__left">
            <h1 className="mpHeader__title">{header.title}</h1>
            <div className="mpHeader__sub">{header.subtitle}</div>
          </div>
          <div className="mpHeader__searchWrap">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              className="mpHeader__search"
              value={header.searchValue}
              onChange={(e) => header.onSearchChange(e.target.value)}
              placeholder="Search For Opportunities"
            />
            <button type="button" className="mpHeader__filterBtn" aria-label="Filter" onClick={header.onFilterClick}>
              <i className="fa-solid fa-filter" aria-hidden="true" />
            </button>
          </div>
        </header>

        {loading && (
          <div style={{ textAlign: "center", padding: "3rem", color: "#aaa" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem" }} />
            <p style={{ marginTop: "1rem" }}>Loading projects...</p>
          </div>
        )}

        {!loading && (
          <>
            <div className="mp__count">{projects.length} Projects Found</div>
            <div className="mp__list">
              {projects.map((p) => (
                <article
                  key={p.id}
                  className="mpCard"
                  role="button"
                  tabIndex={0}
                  onClick={() => openDetails(p.id)}
                  onKeyDown={(e) => e.key === "Enter" && openDetails(p.id)}
                >
                  <div className="mpCard__top">
                    <div className="mpCard__titleWrap">
                      <h3 className="mpCard__title">{p.title}</h3>
                      <p className="mpCard__desc">{p.description}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                      <div className={`mpMatch ${p.matchScore >= 90 ? "is-hot" : "is-cool"}`}>
                        <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
                        <span className="mpMatch__num">{p.matchScore}%</span>
                        <span className="mpMatch__lbl">match</span>
                      </div>
                      {onBookmark && (
                        <button
                          type="button"
                          style={{ background: "transparent", border: "none", color: p.isBookmarked ? "#f59e0b" : "#6b7280", cursor: "pointer", fontSize: "1.1rem" }}
                          onClick={(e) => { e.stopPropagation(); onBookmark(p.id); }}
                          aria-label={p.isBookmarked ? "Remove bookmark" : "Bookmark"}
                        >
                          <i className={p.isBookmarked ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mpCard__tags">
                    {p.tags.map((t) => <span className="mpTag" key={t}>{t}</span>)}
                  </div>

                  <div className="mpCard__bottom">
                    <div className="mpCard__meta">
                      <span className="mpMeta">
                        <i className="fa-solid fa-dollar-sign" aria-hidden="true" />
                        {formatBudget(p.budgetMin, p.budgetMax)}
                      </span>
                      <span className="mpMeta">
                        <i className="fa-regular fa-clock" aria-hidden="true" />
                        {p.postedAgo}
                      </span>
                      <span className="mpMeta">
                        <i className="fa-solid fa-inbox" aria-hidden="true" />
                        {p.proposalsCount} proposals
                      </span>
                      {p.location && (
                        <span className="mpMeta">
                          <i className="fa-solid fa-map-marker-alt" aria-hidden="true" />
                          {p.location}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {p.hasApplied
                        ? <span style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "#1a3a2a", color: "#4ade80", fontSize: "0.85rem" }}>✓ Applied</span>
                        : (
                          <button
                            className="mpApply"
                            type="button"
                            onClick={(e) => { e.stopPropagation(); openDetails(p.id); }}
                          >
                            Apply Now
                          </button>
                        )
                      }
                    </div>
                  </div>
                </article>
              ))}

              {projects.length === 0 && (
                <div className="mpEmpty">No projects match your search.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function formatBudget(min, max) {
  if (!min && !max) return "Budget TBD";
  const fmt = (n) => `$${Number(n).toLocaleString()}`;
  return `${fmt(min)} – ${fmt(max)}`;
}
