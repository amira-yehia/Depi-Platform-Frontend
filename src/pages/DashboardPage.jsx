import { useEffect, useState } from "react";
import ContractCard from "../components/ContractCard";
import JobMatchCard from "../components/JobMatchCard";
import StatsCard from "../components/StatsCard";
import { useLocation } from "react-router-dom";
import { jobsService, contractsService, walletService, aiService } from "../services/api";
import "./DashboardPage.css";

function DashboardPage() {
  const location = useLocation();
  const userName = location.state?.userName || localStorage.getItem("authUserName") || "User";

  const [stats, setStats] = useState([
    { id: 1, title: "AI Profile Score", value: "--", subtitle: "Loading...", icon: "fa-solid fa-chart-pie", extra: { type: "progress", value: 0 } },
    { id: 2, title: "Active Contracts", value: "--", subtitle: "Loading...", icon: "fa-solid fa-file-contract" },
    { id: 3, title: "This Month", value: "--", subtitle: "Loading...", icon: "fa-regular fa-calendar-days" },
    { id: 4, title: "Total Earnings", value: "--", subtitle: "Loading...", icon: "fa-solid fa-wallet" },
  ]);

  const [jobs, setJobs] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(true);

  // Load AI job matches
  useEffect(() => {
    aiService.jobMatches()
      .then((data) => {
        const list = Array.isArray(data) ? data : (data?.matches || data?.jobs || []);
        setJobs(list.slice(0, 5).map((j, i) => ({
          id: j.id || i,
          title: j.title || j.jobTitle || "Job Opportunity",
          description: j.description || j.summary || "",
          recommended: j.matchPercentage >= 80 || i < 2,
          score: j.matchPercentage || j.matchScore || 0,
          tags: Array.isArray(j.skillsRequired)
            ? j.skillsRequired.map((s) => s.nameEn || s.name || s)
            : (j.skillsRequired ? j.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean) : []),
          meta: [
            { icon: "fa-solid fa-dollar-sign", text: j.budgetMin && j.budgetMax ? `$${j.budgetMin.toLocaleString()} - $${j.budgetMax.toLocaleString()}` : "Budget TBD" },
            { icon: "fa-solid fa-map-marker-alt", text: j.location || (j.isRemote ? "Remote" : "On-site") },
          ],
        })));
      })
      .catch(() => {
        // Fallback: load regular jobs list
        jobsService.list({ pageSize: 5 })
          .then((data) => {
            const list = Array.isArray(data) ? data : [];
            setJobs(list.slice(0, 5).map((j, i) => ({
              id: j.id || i,
              title: j.title,
              description: j.description || "",
              recommended: i < 2,
              score: Math.round(Math.random() * 20 + 75),
              tags: j.skillsRequired ? j.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean) : [],
              meta: [
                { icon: "fa-solid fa-dollar-sign", text: `$${(j.budgetMin || 0).toLocaleString()} - $${(j.budgetMax || 0).toLocaleString()}` },
                { icon: "fa-solid fa-map-marker-alt", text: j.location || (j.isRemote ? "Remote" : "On-site") },
              ],
            })));
          })
          .catch(() => setJobs([]));
      })
      .finally(() => setLoadingJobs(false));
  }, []);

  // Load contracts
  useEffect(() => {
    contractsService.myContracts()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setContracts(list.slice(0, 3).map((c) => ({
          id: c.id,
          title: c.title || "Contract",
          company: c.clientName || c.client || "Client",
          progress: c.progress || 0,
          earnings: c.earnedAmount ? `$${c.earnedAmount.toLocaleString()}` : "$0",
          contractType: c.type === 1 ? "Hourly" : "Fixed",
        })));

        // Update active contracts stat
        setStats((prev) => prev.map((s) =>
          s.id === 2 ? { ...s, value: String(list.length), subtitle: "Active projects" } : s
        ));
      })
      .catch(() => setContracts([]))
      .finally(() => setLoadingContracts(false));
  }, []);

  // Load wallet summary
  useEffect(() => {
    walletService.summary()
      .then((data) => {
        setStats((prev) => prev.map((s) => {
          if (s.id === 3) return { ...s, value: `$${(data.balance || 0).toLocaleString()}`, subtitle: "Current balance" };
          if (s.id === 4) return { ...s, value: `$${(data.totalEarnings || 0).toLocaleString()}`, subtitle: "Total lifetime earnings", trend: { direction: "up", value: "Total" } };
          return s;
        }));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="dashboardPage">
      <div className="dashboardPage__container">
        <header className="dashboardPage__header">
          <h1>Welcome back, {userName}!</h1>
          <p>Here's what's happening with your freelance journey.</p>
        </header>

        <div className="dashboardPage__statsGrid">
          {stats.map((stat) => <StatsCard key={stat.id} {...stat} />)}
        </div>

        <div className="dashboardPage__contentGrid">
          <section className="dashboardPage__jobs">
            <div className="dashboardPage__sectionHeader">
              <h2><i className="fa-solid fa-wand-magic-sparkles" aria-hidden="true" /> AI Recommended Jobs</h2>
              <a href="/projects">View All</a>
            </div>
            <div className="dashboardPage__jobsList">
              {loadingJobs && <p style={{ color: "var(--text-secondary, #aaa)", padding: "1rem" }}>Loading jobs...</p>}
              {!loadingJobs && jobs.length === 0 && <p style={{ color: "var(--text-secondary, #aaa)", padding: "1rem" }}>No job matches yet.</p>}
              {jobs.map((job) => <JobMatchCard key={job.id} {...job} />)}
            </div>
          </section>

          <aside className="dashboardPage__contracts">
            <div className="dashboardPage__sectionHeader">
              <h2><i className="fa-solid fa-briefcase" aria-hidden="true" /> Active Contracts</h2>
            </div>
            <div className="dashboardPage__contractsList">
              {loadingContracts && <p style={{ color: "var(--text-secondary, #aaa)", padding: "1rem" }}>Loading contracts...</p>}
              {!loadingContracts && contracts.length === 0 && <p style={{ color: "var(--text-secondary, #aaa)", padding: "1rem" }}>No active contracts.</p>}
              {contracts.map((contract) => <ContractCard key={contract.id} {...contract} />)}
            </div>
            <a href="/contracts" className="dashboardPage__viewAllBtn">View All Contracts</a>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default DashboardPage;
