import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FindProjectsView from "../components/FindProjects/FindProjectsView";
import { jobsService } from "../services/api";

const CATEGORY_OPTIONS = ["All Categories", "Mobile Development", "UI/UX Design", "Content Writing", "Backend Development", "Video Production", "DevOps", "AI / Machine Learning", "Other"];

const BUDGET_OPTIONS = [
  { label: "All Budgets", value: "all" },
  { label: "$0 - $5,000", value: "0-5000" },
  { label: "$5,000 - $15,000", value: "5000-15000" },
  { label: "$15,000 - $30,000", value: "15000-30000" },
  { label: "$30,000+", value: "30000+" },
];

function parseBudgetValue(value) {
  if (value === "all") return { min: null, max: null };
  if (value.endsWith("+")) return { min: Number(value.replace("+", "")), max: null };
  const [minStr, maxStr] = value.split("-");
  return { min: Number(minStr), max: Number(maxStr) };
}

// Map API job type number to readable string
const JOB_TYPE_LABEL = { 0: "Other", 1: "Full Time", 2: "Part Time", 3: "Freelance", 4: "Contract" };

export default function FindProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [budget, setBudget] = useState("all");
  const [minMatch, setMinMatch] = useState(0);
  const [page, setPage] = useState(1);

  function handleReturn() {
    if (window.history.length > 1) { navigate(-1); return; }
    navigate("/dashboard");
  }

  useEffect(() => {
    setLoading(true);
    setError("");
    jobsService.list({ searchTerm: search || undefined, page, pageSize: 20 })
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProjects(list.map((j) => ({
          id: j.id,
          title: j.title,
          description: j.description || "",
          tags: j.skillsRequired
            ? j.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          budgetMin: j.budgetMin || 0,
          budgetMax: j.budgetMax || 0,
          location: j.isRemote ? "Remote" : (j.location || "On-site"),
          postedAgo: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : "Recently",
          proposalsCount: j.applicationsCount || 0,
          matchScore: Math.round(Math.random() * 25 + 65), // until AI matches available
          category: JOB_TYPE_LABEL[j.type] || "Other",
          hasApplied: j.hasApplied,
          isBookmarked: j.isBookmarked,
        })));
      })
      .catch((err) => setError(err.message || "Failed to load jobs."))
      .finally(() => setLoading(false));
  }, [search, page]);

  const filteredProjects = useMemo(() => {
    const { min, max } = parseBudgetValue(budget);
    return projects.filter((p) => {
      const matchesCat = category === "All Categories" ? true : p.category === category;
      const matchesBudget = min === null && max === null ? true
        : max === null ? p.budgetMin >= min
        : p.budgetMin >= min && p.budgetMax <= max;
      const matchesMinMatch = p.matchScore >= minMatch;
      return matchesCat && matchesBudget && matchesMinMatch;
    });
  }, [projects, category, budget, minMatch]);

  const openDetails = (projectId) => navigate(`/projects/${projectId}`);

  return (
    <FindProjectsView
      header={{
        title: "Find Jobs",
        subtitle: "Opportunities matched for you",
        onReturn: handleReturn,
        searchValue: search,
        onSearchChange: (v) => { setSearch(v); setPage(1); },
      }}
      filters={{
        category, categories: CATEGORY_OPTIONS, onCategoryChange: setCategory,
        budget, budgets: BUDGET_OPTIONS, onBudgetChange: setBudget,
        minMatch, onMinMatchChange: setMinMatch,
        onReset: () => { setSearch(""); setCategory("All Categories"); setBudget("all"); setMinMatch(0); setPage(1); },
      }}
      projects={loading ? [] : filteredProjects.sort((a, b) => b.matchScore - a.matchScore)}
      loading={loading}
      error={error}
      onOpen={openDetails}
      onApply={openDetails}
    />
  );
}
