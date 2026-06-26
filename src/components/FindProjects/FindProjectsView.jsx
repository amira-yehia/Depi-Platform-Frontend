import "./FindProjectsView.css";

export default function FindProjectsView({
  header,
  filters,
  projects,
  onOpen,
  onApply,
  loading,
  error,
}) {
  return (
    <div className="fpv">
      <div className="fpv__container">
        <Header {...header} />

        <div className="fpv__layout">
          <aside className="fpv__filters">
            <FiltersPanel filters={filters} />
          </aside>

          <main className="fpv__main">
            {loading ? (
              <div className="fpvLoading">
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "2rem" }} />
                <p>Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="fpvEmpty" style={{ color: "#f87171" }}>{error}</div>
            ) : (
              <>
                <TopRow count={projects.length} />
                <div className="fpv__list">
                  {projects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      onOpen={() => onOpen(p.id)}
                      onApply={() => onApply(p.id)}
                    />
                  ))}
                  {projects.length === 0 && <EmptyState text="No jobs match your filters." />}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────── */

function Header({ title, subtitle, onReturn, searchValue, onSearchChange }) {
  return (
    <header className="fpvHeader">
      <div className="fpvHeader__left">
        <button type="button" className="fpvHeader__backBtn" onClick={onReturn}>
          <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Return
        </button>
        <h1 className="fpvHeader__title">{title}</h1>
        <div className="fpvHeader__sub">{subtitle}</div>
      </div>
      <div className="fpvHeader__searchWrap">
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <input
          className="fpvHeader__search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search jobs by title or keywords..."
        />
      </div>
    </header>
  );
}

function TopRow({ count }) {
  return (
    <div className="fpvTopRow">
      <div className="fpvTopRow__count">{count} jobs found</div>
      <div className="fpvTopRow__sort">
        <i className="fa-solid fa-arrow-trend-up" aria-hidden="true" /> Sorted by match score
      </div>
    </div>
  );
}

function FiltersPanel({ filters }) {
  return (
    <section className="fpvFilters">
      <div className="fpvFilters__head">
        <div className="fpvFilters__headLeft">
          <i className="fa-solid fa-filter" aria-hidden="true" />
          <div className="fpvFilters__headTitle">Filters</div>
        </div>
      </div>

      <FilterSection title="Category">
        <PillList
          options={filters.categories.map((c) => ({ label: c, value: c }))}
          value={filters.category}
          onChange={filters.onCategoryChange}
        />
      </FilterSection>

      <FilterSection title="Budget Range">
        <PillList
          options={filters.budgets}
          value={filters.budget}
          onChange={filters.onBudgetChange}
        />
      </FilterSection>

      <FilterSection title={`Min Match Score: ${filters.minMatch}%`}>
        <input
          className="fpvSlider"
          type="range"
          min="0"
          max="100"
          step="1"
          value={filters.minMatch}
          onChange={(e) => filters.onMinMatchChange(Number(e.target.value))}
        />
        <div className="fpvFilters__ticks">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </FilterSection>

      <button className="fpvFilters__reset" type="button" onClick={filters.onReset}>
        Reset Filters
      </button>
    </section>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="fpvSection">
      <div className="fpvSection__title">{title}</div>
      <div className="fpvSection__body">{children}</div>
    </div>
  );
}

function PillList({ options, value, onChange }) {
  return (
    <div className="fpvPills">
      {options.map((op) => (
        <button
          key={op.value}
          type="button"
          className={`fpvPills__pill ${value === op.value ? "is-active" : ""}`}
          onClick={() => onChange(op.value)}
        >
          {op.label}
        </button>
      ))}
    </div>
  );
}

function ProjectCard({ project, onOpen, onApply }) {
  return (
    <article
      className="fpvCard fpvCard--clickable"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      <div className="fpvCard__top">
        <h3 className="fpvCard__title">{project.title}</h3>
        <div className="fpvCard__score">
          <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
          <span className="fpvCard__scoreNum">{project.matchScore}%</span>
          <span className="fpvCard__scoreLbl">match</span>
        </div>
      </div>

      <p className="fpvCard__desc">{project.description}</p>

      <div className="fpvCard__tags">
        {project.tags.map((t) => <span className="fpvTag" key={t}>{t}</span>)}
      </div>

      <div className="fpvCard__bottom">
        <div className="fpvCard__meta">
          <span className="fpvCard__metaItem">
            <i className="fa-solid fa-dollar-sign" aria-hidden="true" />
            {formatBudget(project.budgetMin, project.budgetMax)}
          </span>
          <span className="fpvCard__metaItem">
            <i className="fa-solid fa-location-dot" aria-hidden="true" />
            {project.location || "Remote"}
          </span>
          <span className="fpvCard__metaItem">
            <i className="fa-regular fa-clock" aria-hidden="true" />
            {project.postedAgo}
          </span>
          <span className="fpvCard__metaItem">
            <i className="fa-solid fa-inbox" aria-hidden="true" />
            {project.proposalsCount} proposals
          </span>
        </div>

        {project.hasApplied ? (
          <span style={{ padding: "0.45rem 1rem", borderRadius: "8px", background: "#1a3a2a", color: "#4ade80", fontSize: "0.82rem", fontWeight: 600 }}>
            ✓ Applied
          </span>
        ) : (
          <button
            className="fpvCard__applyInline"
            type="button"
            onClick={(e) => { e.stopPropagation(); onApply(); }}
          >
            Apply Now
          </button>
        )}
      </div>
    </article>
  );
}

function EmptyState({ text }) {
  return <div className="fpvEmpty">{text}</div>;
}

function formatBudget(min, max) {
  if (!min && !max) return "Budget TBD";
  const fmt = (n) => `$${Number(n).toLocaleString()}`;
  return `${fmt(min)} – ${fmt(max)}`;
}
