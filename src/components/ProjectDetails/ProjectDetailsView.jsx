import "./ProjectDetailsView.css";

export default function ProjectDetailsView({ project, onApply, onSave }) {
  return (
    <div className="pd">
      <div className="pd__container">
        <TopNav />

        <div className="pd__layout">
          <main className="pd__main">
            <HeroCard project={project} onApply={onApply} />

            <SectionCard title="Project Description" icon="fa-regular fa-clipboard">
              <p className="pdText">{project.description}</p>
            </SectionCard>

            <SectionCard title="Key Responsibilities" icon="fa-regular fa-circle-check">
              <ol className="pdList">
                {project.responsibilities.map((r, idx) => (
                  <li key={idx} className="pdList__item">
                    <span className="pdList__num">{idx + 1}</span>
                    <span className="pdList__text">{r}</span>
                  </li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard title="Required Skills" icon="fa-solid fa-bolt">
              <div className="pdSkillsNote">Highlighted = skills that match your profile</div>
              <div className="pdChips">
                {project.skills.map((s) => (
                  <span className="pdChip" key={s}>{s}</span>
                ))}
              </div>
            </SectionCard>
          </main>

          <aside className="pd__side">
            <MatchCard match={project.match} />

            <button className="pdSide__apply" type="button" onClick={onApply}>
              Apply to Project
            </button>

            <button className="pdSide__save" type="button" onClick={onSave}>
              Save for Later
            </button>

            <GlanceCard glance={project.glance} />

            <ClientCard client={project.client} />

            <div className="pdSide__bottomApplyWrap">
              <button className="pdSide__bottomApply" type="button" onClick={onApply}>
                Apply Now <span aria-hidden="true">→</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function TopNav() {
  return (
    <div className="pdTopNav">
      <div className="pdTopNav__brand">
        <img src="/images/logo.png" alt="NextHire" />
      </div>
      <div className="pdTopNav__links">
        <a href="#!" className="pdTopNav__link">Browse</a>
        <a href="#!" className="pdTopNav__link">My Projects</a>
        <a href="#!" className="pdTopNav__link">Messages</a>
      </div>
    </div>
  );
}

function HeroCard({ project, onApply }) {
  return (
    <section className="pdHero">
      <div className="pdHero__metaTop">
        <span className="pdPill">{project.category}</span>
        <span className="pdHero__metaSmall">
          <i className="fa-regular fa-clock" aria-hidden="true" /> {project.postedAgo}
        </span>
        <span className="pdHero__metaSmall">
          <i className="fa-solid fa-user-group" aria-hidden="true" /> {project.applicants} applicants
        </span>
      </div>

      <h1 className="pdHero__title">{project.title}</h1>

      <div className="pdHero__metaRow">
        <span className="pdHero__metaSmall">
          <i className="fa-solid fa-location-dot" aria-hidden="true" /> {project.location}
        </span>
        <span className="pdHero__metaSmall">
          <i className="fa-regular fa-calendar" aria-hidden="true" /> {project.duration}
        </span>
      </div>

      <div className="pdHero__bottom">
        <div className="pdHero__budget">
          <i className="fa-solid fa-dollar-sign" aria-hidden="true" />
          <div>
            <div className="pdHero__budgetLabel">Budget</div>
            <div className="pdHero__budgetVal">{project.budgetText}</div>
          </div>
        </div>

        <button className="pdHero__apply" type="button" onClick={onApply}>
          Apply Now
        </button>
      </div>
    </section>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <section className="pdCard">
      <div className="pdCard__head">
        <i className={icon} aria-hidden="true" />
        <h2 className="pdCard__title">{title}</h2>
      </div>
      <div className="pdCard__body">{children}</div>
    </section>
  );
}

function MatchCard({ match }) {
  return (
    <section className="pdMatch">
      <div className="pdMatch__top">
        <i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" />
        <span>AI Match Score</span>
      </div>

      <div className="pdMatch__ring">
        <div className="pdMatch__ringInner">
          <div className="pdMatch__score">{match.score}%</div>
          <div className="pdMatch__small">match</div>
        </div>
      </div>

      <div className="pdStars">
        {Array.from({ length: 5 }).map((_, i) => (
          <i
            key={i}
            className={`fa-solid fa-star ${i < match.stars ? "is-on" : "is-off"}`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="pdBars">
        {match.bars.map((b) => (
          <div className="pdBar" key={b.label}>
            <div className="pdBar__row">
              <span>{b.label}</span>
              <span>{b.value}%</span>
            </div>
            <div className="pdBar__track">
              <div className="pdBar__fill" style={{ width: `${b.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GlanceCard({ glance }) {
  return (
    <section className="pdGlance">
      <div className="pdGlance__title">Project at a Glance</div>

      <div className="pdGlance__grid">
        <div className="pdMini">
          <div className="pdMini__top">
            <i className="fa-solid fa-dollar-sign" aria-hidden="true" />
            <span>Budget</span>
          </div>
          <div className="pdMini__val">{glance.budgetShort}</div>
        </div>

        <div className="pdMini">
          <div className="pdMini__top">
            <i className="fa-regular fa-clock" aria-hidden="true" />
            <span>Duration</span>
          </div>
          <div className="pdMini__val">{glance.duration}</div>
        </div>

        <div className="pdMini pdMini--big">
          <div className="pdMini__top">
            <i className="fa-solid fa-location-dot" aria-hidden="true" />
            <span>Location</span>
          </div>
          <div className="pdMini__val">{glance.location}</div>
        </div>

        <div className="pdMini pdMini--big">
          <div className="pdMini__top">
            <i className="fa-solid fa-user-group" aria-hidden="true" />
            <span>Applicants</span>
          </div>
          <div className="pdMini__val">{glance.applicantsText}</div>
        </div>
      </div>
    </section>
  );
}

function ClientCard({ client }) {
  return (
    <section className="pdClient">
      <div className="pdClient__head">
        <div className="pdClient__title">
          <i className="fa-regular fa-shield" aria-hidden="true" /> About the Client
        </div>
      </div>

      <div className="pdClient__row">
        <div className="pdClient__avatar">{client.initials}</div>
        <div>
          <div className="pdClient__name">{client.name}</div>
          <div className="pdClient__since">{client.memberSince}</div>
        </div>
      </div>

      <div className="pdClient__rating">
        <span className="pdClient__stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <i key={i} className="fa-solid fa-star is-on" aria-hidden="true" />
          ))}
        </span>
        <span className="pdClient__rate">{client.rating}</span>
        <span className="pdClient__reviews">({client.reviews} reviews)</span>
      </div>

      <div className="pdClient__divider" />

      <div className="pdClient__stats">
        <div className="pdClient__stat">
          <span>Projects posted</span>
          <strong>{client.projectsPosted}</strong>
        </div>
        <div className="pdClient__stat">
          <span>Hire rate</span>
          <strong>{client.hireRate}</strong>
        </div>
      </div>
    </section>
  );
}