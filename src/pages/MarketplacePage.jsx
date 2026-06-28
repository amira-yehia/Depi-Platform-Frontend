import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MarketplacePage.css";
import MarketplaceView from "../components/MarketPlace/MarketplaceView";
import { profilesService, bookmarksService } from "../services/api";

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Load available profiles + bookmarks in parallel
  useEffect(() => {
    setLoading(true);
    Promise.all([
      profilesService.available({ search: search || undefined, page, pageSize: 20 }),
      bookmarksService.ids().catch(() => []),
    ])
      .then(([profilesData, bIds]) => {
        const list = Array.isArray(profilesData) ? profilesData : [];
        setBookmarkedIds(Array.isArray(bIds) ? bIds : []);
        setProjects(list.map((profile, index) => ({
          id: profile.id || profile.userId || `profile-${index}`,
          title: profile.displayName || profile.fullName || profile.name || `Freelancer ${index + 1}`,
          description: profile.title || profile.bio || "",
          tags: Array.isArray(profile.skills)
            ? profile.skills.map((s) => s.nameEn || s.name || s)
            : [],
          budgetMin: profile.hourlyRate || 0,
          budgetMax: profile.hourlyRate || 0,
          postedAgo: profile.lastActiveAt ? new Date(profile.lastActiveAt).toLocaleDateString() : "Recently",
          proposalsCount: profile.projectCount || profile.completedProjects || 0,
          matchScore: profile.profileScore || Math.round(65 + Math.random() * 30),
          isBookmarked: profile.isBookmarked || false,
          hasApplied: false,
          location: profile.country || profile.location || "",
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
