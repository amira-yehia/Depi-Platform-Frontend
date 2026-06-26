import StatsCard from "./StatsCard";
import JobMatchCard from "./JobMatchCard";
import ContractCard from "./ContractCard";
import "./DashboardSection.css";
import { useEffect, useState } from "react";

import {
  profilesService,
  walletService,
  contractsService,
  skillsService,
  portfolioService,
  aiService,
} from "../../services/api";

function DashboardSection() {
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [skills, setSkills] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      const [
        profileData,
        walletData,
        contractsData,
        skillsData,
        portfolioData,
        jobsData,
        transactionsData,
      ] = await Promise.all([
        profilesService.me(),
        walletService.summary(),
        contractsService.myContracts(),
        skillsService.mySkills(),
        portfolioService.my(),
        aiService.jobMatches(),
        walletService.transactions(),
      ]);
      console.log("PROFILE", profileData);
      setProfile(profileData);
      setWallet(walletData);
      setContracts(contractsData || []);
      setSkills(skillsData || []);
      setPortfolio(portfolioData || []);
      setJobs(jobsData?.items || jobsData || []);
      setTransactions(
        Array.isArray(transactionsData)
          ? transactionsData
          : transactionsData?.items || [],
      );
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);
  if (error) {
    return (
      <div className="container py-5 text-center text-danger">{error}</div>
    );
  }

  const profileScore = Math.min(
    100,
    portfolio.length * 10 +
      skills.length * 5 +
      (profile?.completedProjects || 0) * 2 +
      (profile?.bio ? 20 : 0) +
      (profile?.title ? 20 : 0),
  );
  const statsData = [
    {
      id: 1,
      title: "AI Profile Score",
      value: `${profileScore}%`,
      subtitle: profile?.title || "",
      icon: "fas fa-chart-pie",
      extra: {
        type: "progress",
        value: profileScore,
      },
    },
    {
      id: 2,
      title: "Active Contracts",
      value: contracts.length,
      subtitle: "Current Projects",
      icon: "fas fa-file-contract",
    },
    {
      id: 3,
      title: "Available Balance",
      value: `$${wallet?.availableBalance || 0}`,
      subtitle: "Wallet",
      icon: "fas fa-wallet",
    },
    {
      id: 4,
      title: "Total Earnings",
      value: `$${wallet?.totalEarnings || 0}`,
      subtitle: `${profile?.completedProjects || 0} completed projects`,
      icon: "fas fa-dollar-sign",
    },
  ];

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <section className="dashboardSection">
      <div className="container py-5">
        {/* Header */}
        <div className="dashboardHeader mb-5">
          <h1 className="text-white fw-bold display-5 mb-1">
            Welcome back, {profile?.displayName || "Freelancer"} 👋
          </h1>
          <p className="text-secondary">
            Here's what's happening with your freelance journey
          </p>
        </div>

        {/* Stats */}
        <div className="dashboardStatsGrid mb-5">
          {statsData.map((stat) => (
            <StatsCard key={stat.id} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="row mb-5">
          <div className="col-md-3">
            <button className="btn btn-warning w-100 py-3">
              <i className="fas fa-search me-2"></i>
              Find Jobs
            </button>
          </div>

          <div className="col-md-3">
            <button className="btn btn-outline-light w-100 py-3">
              <i className="fas fa-user-edit me-2"></i>
              Update Profile
            </button>
          </div>

          <div className="col-md-3">
            <button className="btn btn-outline-light w-100 py-3">
              <i className="fas fa-plus me-2"></i>
              Add Portfolio
            </button>
          </div>

          <div className="col-md-3">
            <button className="btn btn-outline-light w-100 py-3">
              <i className="fas fa-wallet me-2"></i>
              Wallet
            </button>
          </div>
        </div>

        {/* Charts */}
        <div className="row mb-5">
          <div className="col-lg-6">
            <div className="dashboardCard p-4">
              <h5 className="text-white mb-4">Earnings Overview</h5>

              <div
                style={{
                  height: "250px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                📈 Earnings Chart
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="dashboardCard p-4">
              <h5 className="text-white mb-4">Contract Progress</h5>

              <div
                style={{
                  height: "250px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                📊 Progress Chart
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboardContentGrid">
          {/* Jobs */}
          <div className="dashboardJobsColumn">
            <div className="sectionHeader d-flex justify-content-between mb-4">
              <h3 className="text-white">✨ AI Recommended Jobs</h3>

              <button className="btn btn-link text-warning text-decoration-none p-0">
                View All
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="text-secondary">No recommended jobs</div>
            ) : (
              jobs.map((job) => (
                <JobMatchCard
                  key={job.jobId}
                  id={job.jobId}
                  title={job.title}
                  description={job.reason}
                  recommended
                  score={job.matchPercentage}
                  tags={job.matchedSkills || []}
                  meta={[
                    {
                      icon: "fas fa-dollar-sign",
                      text: `${job.budgetMin} - ${job.budgetMax}`,
                    },
                    {
                      icon: "fas fa-location-dot",
                      text: job.location || "Remote",
                    },
                  ]}
                />
              ))
            )}
          </div>

          {/* Contracts */}
          <div className="dashboardContractsColumn">
            <h3 className="text-white mb-4">💼 Active Contracts</h3>

            {contracts.length === 0 ? (
              <div className="text-secondary">No active contracts</div>
            ) : (
              contracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  title={contract.projectTitle}
                  company={contract.clientName}
                  progress={contract.progressPercentage}
                  earnings={`$${contract.totalAmount}`}
                  contractType={contract.statusDescription}
                />
              ))
            )}

            <button className="viewAllBtn mt-4 w-100">
              View All Contracts
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="dashboardCard mt-5 p-4">
          <h4 className="text-white mb-4">Recent Transactions</h4>

          {transactions.length === 0 ? (
            <div className="text-secondary">No transactions found</div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="d-flex justify-content-between py-3 border-bottom border-secondary"
              >
                <div>
                  <h6 className="text-white mb-1">
                    {transaction.description || transaction.type}
                  </h6>

                  <small className="text-secondary">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </small>
                </div>

                <div className="text-success fw-bold">
                  ${transaction.netAmount ?? transaction.amount ?? 0}
                </div>
              </div>
            ))
          )}
        </div>

        {/* AI Insights */}
        <div className="dashboardCard mt-5 p-4">
          <h4 className="text-warning mb-3">🤖 AI Insights</h4>

          <ul className="text-light">
            <li>
              Add 2 more portfolio projects to increase profile score to 100%.
            </li>

            <li>React + AI jobs have increased by 35% this week.</li>

            <li>Your profile matches 18 high-paying jobs.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default DashboardSection;

// import StatsCard from './StatsCard';
// import JobMatchCard from './JobMatchCard';
// import ContractCard from './ContractCard';
// import './DashboardSection.css';

// function DashboardSection() {

//     // === بيانات الـ Stats ===
//     const statsData = [
//         {
//             id: 1,
//             title: "AI Profile Score",
//             value: "92%",
//             subtitle: "Complete your portfolio to reach 100%",
//             icon: "fas fa-chart-pie",
//             extra: { type: "progress", value: 92 }
//         },
//         {
//             id: 2,
//             title: "Active Contracts",
//             value: "2",
//             subtitle: "📈 On Track",
//             icon: "fas fa-file-contract"
//         },
//         {
//             id: 3,
//             title: "This Month",
//             value: "$4,200",
//             subtitle: "",
//             icon: "fas fa-calendar-alt",
//             trend: { direction: 'up', value: '+18%' }
//         },
//         {
//             id: 4,
//             title: "Total Earnings",
//             value: "$28,450",
//             subtitle: "From 24 completed projects",
//             icon: "fas fa-wallet",
//             trend: { direction: 'up', value: '+12%' }
//         }
//     ];

//     // === بيانات الـ Jobs ===
//     const jobsData = [
//         {
//             id: 1,
//             title: "Full Stack Developer for SaaS Platform",
//             description: "Looking for experienced developer to build scalable web application with modern tech stack.",
//             recommended: true,
//             score: 94,
//             tags: ["React", "Node.js", "PostgreSQL"],
//             meta: [
//                 { icon: "fas fa-dollar-sign", text: "$5,000 - $8,000" },
//                 { icon: "far fa-clock", text: "2 hours ago" }
//             ]
//         },
//         {
//             id: 2,
//             title: "Senior React Developer Needed",
//             description: "Build complex UI components for enterprise dashboard project with TypeScript.",
//             recommended: true,
//             score: 86,
//             tags: ["React", "TypeScript", "Tailwind"],
//             meta: [
//                 { icon: "fas fa-dollar-sign", text: "$3,500 - $6,000" },
//                 { icon: "far fa-clock", text: "5 hours ago" }
//             ]
//         },
//         {
//             id: 3,
//             title: "E-commerce Platform Development",
//             description: "Redesign and develop custom e-commerce solution with payment integration.",
//             recommended: false,
//             score: 90,
//             tags: ["React", "Next.js", "Stripe"],
//             meta: [
//                 { icon: "fas fa-dollar-sign", text: "$4,000 - $7,000" },
//                 { icon: "far fa-clock", text: "1 day ago" }
//             ]
//         }
//     ];

//     // === بيانات الـ Contracts ===
//     const contractsData = [
//         {
//             id: 1,
//             title: "Mobile App UI/UX",
//             company: "TechCorp Inc",
//             progress: 85,
//             earnings: "$2,400",
//             contractType: "Hourly"
//         },
//         {
//             id: 2,
//             title: "Dashboard Redesign",
//             company: "StartupXYZ",
//             progress: 45,
//             earnings: "$1,800",
//             contractType: "Fixed"
//         }
//     ];

//     return (
//         <section className="dashboardSection">
//             <div className="container py-5">

//                 {/* Welcome Header */}
//                 <div className="dashboardHeader mb-5">
//                     <h1 className="text-white fw-bold display-5 mb-1">
//                         Welcome back, Alex! 👋
//                     </h1>
//                     <p className="text-secondary fs-5 opacity-75">
//                         Here's what's happening with your freelance journey
//                     </p>
//                 </div>

//                 {/* Top Stats Grid */}
//                 <div className="dashboardStatsGrid mb-5">
//                     {statsData.map(stat => (
//                         <StatsCard key={stat.id} {...stat} />
//                     ))}
//                 </div>

//                 {/* Content Grid: Jobs + Contracts */}
//                 <div className="dashboardContentGrid">

//                     {/* Left Side: Recommended Jobs */}
//                     <div className="dashboardJobsColumn">
//                         <div className="sectionHeader d-flex justify-content-between align-items-center mb-4">
//                             <h3 className="text-white fw-bold m-0">
//                                 <i className="fas fa-sparkles me-2 text-warning"></i>
//                                 AI Recommended Jobs
//                             </h3>
//                             <a href="#view-all" className="text-orange fw-bold text-decoration-none">
//                                 View All
//                             </a>
//                         </div>

//                         <div className="jobsList">
//                             {jobsData.map(job => (
//                                 <JobMatchCard key={job.id} {...job} />
//                             ))}
//                         </div>
//                     </div>

//                     {/* Right Side: Active Contracts */}
//                     <div className="dashboardContractsColumn">
//                         <div className="sectionHeader mb-4">
//                             <h3 className="text-white fw-bold m-0">
//                                 <i className="fas fa-briefcase me-2 text-success"></i>
//                                 Active Contracts
//                             </h3>
//                         </div>

//                         <div className="contractsList">
//                             {contractsData.map(contract => (
//                                 <ContractCard key={contract.id} {...contract} />
//                             ))}
//                         </div>

//                         <button className="viewAllBtn mt-4 w-100">
//                             View All Contracts
//                         </button>
//                     </div>

//                 </div>

//             </div>
//         </section>
//     );
// }

// export default DashboardSection;
