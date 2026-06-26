import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MarketplacePage.css";
import MarketplaceView from "../components/MarketPlace/MarketplaceView";
import { jobsService, bookmarksService } from "../services/api";

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Load jobs + bookmarks in parallel
  useEffect(() => {
    setLoading(true);
    Promise.all([
      jobsService.list({ searchTerm: search || undefined, page, pageSize: 20 }),
      bookmarksService.ids().catch(() => []),
    ])
      .then(([jobsData, bIds]) => {
        const list = Array.isArray(jobsData) ? jobsData : [];
        setBookmarkedIds(Array.isArray(bIds) ? bIds : []);
        setProjects(list.map((j) => ({
          id: j.id,
          title: j.title,
          description: j.description || "",
          tags: j.skillsRequired
            ? j.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          budgetMin: j.budgetMin || 0,
          budgetMax: j.budgetMax || 0,
          postedAgo: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "Recently",
          proposalsCount: j.applicationsCount || 0,
          matchScore: Math.round(65 + Math.random() * 30),
          isBookmarked: j.isBookmarked,
          hasApplied: j.hasApplied,
          location: j.isRemote ? "Remote" : (j.location || ""),
        })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, page]);

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [projects, search]);

  const openDetails = (id) => navigate(`/projects/${id}`);

  const handleToggleBookmark = async (projectId) => {
    try {
      await bookmarksService.toggle(projectId);
      setProjects((prev) =>
        prev.map((p) => p.id === projectId ? { ...p, isBookmarked: !p.isBookmarked } : p)
      );
    } catch (err) {
      console.error("Bookmark error:", err.message);
    }
  };

  return (
    <div className="marketplacePage">
      <MarketplaceView
        header={{
          title: "Marketplace",
          subtitle: loading ? "Loading opportunities..." : `${filteredProjects.length} projects found`,
          searchValue: search,
          onSearchChange: (v) => { setSearch(v); setPage(1); },
          onFilterClick: () => {},
        }}
        projects={filteredProjects}
        onOpenProject={openDetails}
        onApply={openDetails}
        onBookmark={handleToggleBookmark}
        loading={loading}
      />
    </div>
  );
}
