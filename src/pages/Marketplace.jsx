import { useEffect, useState } from "react";
import "./MarketplacePage.css";
import { aiService, profilesService } from "../services/api";

const filterTabs = ["All", "Full-Stack", "Design", "Backend", "Mobile", "AI/ML"];

function ScoreBadge({ score }) {
  const colorClass = score >= 90 ? "scoreBadge--green" : score >= 80 ? "scoreBadge--blue" : "scoreBadge--orange";
  return (
    <div className={`scoreBadge ${colorClass}`}>
      <span className="scoreBadge__number">{score}</span>
    </div>
  );
}

function TalentCard({ talent }) {
  return (
    <div className="talentCard">
      <div className="talentCard__main">
        <div className="talentCard__left">
          <div className="talentCard__avatar">
            {talent.avatarUrl
              ? <img src={talent.avatarUrl} alt={talent.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : <span>{talent.initials}</span>
            }
          </div>
          <div className="talentCard__info">
            <h3 className="talentCard__name">{talent.name}</h3>
            <p className="talentCard__role">{talent.role}</p>
            <div className={`talentCard__scorePill ${talent.score >= 90 ? "talentCard__scorePill--green" : "talentCard__scorePill--blue"}`}>
              <i className="fa-solid fa-bolt" />
              <span>{talent.score}% — {talent.scoreLabel}</span>
            </div>
            <div className="talentCard__meta">
              {talent.rate && <span><i className="fa-solid fa-dollar-sign" />{talent.rate}</span>}
              {talent.location && <span><i className="fa-solid fa-location-dot" />{talent.location}</span>}
              {talent.rating && <span><i className="fa-solid fa-star" />{talent.rating}</span>}
              {talent.availability && <span><i className="fa-regular fa-clock" />{talent.availability}</span>}
            </div>
            <div className="talentCard__tags">
              {(talent.tags || []).slice(0, 4).map((tag) => (
                <span key={tag} className="talentCard__tag">{tag}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="talentCard__right">
          <ScoreBadge score={talent.score} />
        </div>
      </div>
      <div className="talentCard__footer">
        <span className="talentCard__stats">{talent.stats}</span>
        <a href={`/profile/${talent.userId}`} className="talentCard__viewLink">
          View details <i className="fa-solid fa-chevron-right" />
        </a>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avgScore: 0, topMatches: 0 });

  useEffect(() => {
    // Try AI top freelancers first, fall back to available profiles
    aiService.topFreelancers()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        return list;
      })
      .catch(() =>
        profilesService.available({ pageSize: 20 }).then((d) => Array.isArray(d) ? d : [])
      )
      .then((list) => {
        const normalized = list.map((f, i) => {
          const score = f.profileScore || f.matchScore || f.score || Math.round(65 + Math.random() * 30);
          const name = f.fullName || f.displayName || f.name || `Freelancer ${i + 1}`;
          const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
          return {
            id: f.id || f.userId || i,
            userId: f.id || f.userId,
            name,
            initials,
            role: f.title || "Freelancer",
            score,
            scoreLabel: score >= 90 ? "Excellent" : score >= 80 ? "Good" : "Fair",
            rate: f.hourlyRate ? `$${f.hourlyRate}/hr` : null,
            location: f.country || f.location || null,
            rating: f.averageRating || f.rating || null,
            availability: f.isAvailable ? "Available now" : "Not available",
            avatarUrl: f.profileImageUrl || null,
            tags: Array.isArray(f.skills) ? f.skills.map((s) => s.nameEn || s.name || s) : [],
            stats: `Score ${score}%`,
            category: f.specialization || f.category || "Other",
          };
        });
        setTalents(normalized);
        const topMatches = normalized.filter((t) => t.score >= 85).length;
        const avgScore = normalized.length ? Math.round(normalized.reduce((sum, t) => sum + t.score, 0) / normalized.length) : 0;
        setStats({ avgScore, topMatches });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = talents.filter((t) => {
    const matchesTab = activeTab === "All" || t.category === activeTab;
    const q = search.toLowerCase();
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q)
      || (t.tags || []).some((tag) => tag.toLowerCase().includes(q));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="mktPage">
      <header className="mktNav">
        <div className="mktNav__logo"><img src="/logo.png" alt="NextHire" /></div>
        <div className="mktNav__tabs">
          <button className="mktNav__tab mktNav__tab--active">Find Talent</button>
        </div>
        <div className="mktNav__right">
          <div className="mktNav__avatar">{(localStorage.getItem("authUserName") || "U")[0].toUpperCase()}</div>
        </div>
      </header>

      <div className="mktBody">
        <div className="mktBody__top">
          <div>
            <h1 className="mktBody__title">AI-Powered Talent Matching</h1>
            <p className="mktBody__subtitle">Ranked by compatibility score — powered by AI</p>
          </div>
          <div className="mktBody__statCards">
            <div className="mktStatCard">
              <i className="fa-solid fa-chart-pie mktStatCard__icon mktStatCard__icon--orange" />
              <div><p className="mktStatCard__label">Avg Score</p><p className="mktStatCard__value">{stats.avgScore}%</p></div>
            </div>
            <div className="mktStatCard">
              <i className="fa-solid fa-user mktStatCard__icon mktStatCard__icon--blue" />
              <div><p className="mktStatCard__label">Top Matches</p><p className="mktStatCard__value">{stats.topMatches}</p></div>
            </div>
          </div>
        </div>

        <div className="mktSearch">
          <div className="mktSearch__bar">
            <i className="fa-solid fa-magnifying-glass" />
            <input type="text" placeholder="Search candidates, skills..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="mktSearch__filterBtn"><i className="fa-solid fa-sliders" /> Filters</button>
        </div>

        <div className="mktTabs">
          {filterTabs.map((tab) => (
            <button key={tab} className={`mktTabs__tab ${activeTab === tab ? "mktTabs__tab--active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
        </div>

        <div className="mktResults">
          <span className="mktResults__count"><strong>{filtered.length}</strong> matches found</span>
          <div className="mktResults__right">
            <button className={`mktResults__viewBtn ${viewMode === "grid" ? "mktResults__viewBtn--active" : ""}`} onClick={() => setViewMode("grid")} aria-label="Grid view"><i className="fa-solid fa-grip" /></button>
            <button className={`mktResults__viewBtn ${viewMode === "list" ? "mktResults__viewBtn--active" : ""}`} onClick={() => setViewMode("list")} aria-label="List view"><i className="fa-solid fa-list" /></button>
          </div>
        </div>

        <div className="mktList">
          {loading && <p style={{ color: "#aaa", textAlign: "center", padding: "2rem" }}>Loading talent...</p>}
          {!loading && filtered.length === 0 && <p className="mktList__empty">No matches found.</p>}
          {filtered.map((talent) => <TalentCard key={talent.id} talent={talent} />)}
        </div>
      </div>
    </div>
  );
}
