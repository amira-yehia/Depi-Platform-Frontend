import { useEffect, useMemo, useState } from "react";
import "./ProposalsPage.css";
import ProposalsView from "../components/Proposals/ProposalsView";
import { proposalsService } from "../services/api";

const TABS = ["Pending", "Accepted", "Rejected", "Withdrawn"];

const STATUS_MAP = {
  0: "Pending", 1: "Pending", 2: "Accepted", 3: "Rejected", 4: "Withdrawn",
  Pending: "Pending", Accepted: "Accepted", Rejected: "Rejected", Withdrawn: "Withdrawn",
};

const NOTE_TYPE_MAP = {
  Pending: "warn", Accepted: "success", Rejected: "danger", Withdrawn: "muted",
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Pending");

  useEffect(() => {
    proposalsService.myAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setProposals(list.map((p) => {
          const status = STATUS_MAP[p.status] || "Pending";
          return {
            id: p.id,
            status,
            title: p.projectTitle || p.title || "Project",
            budget: p.proposedAmount ? `$${Number(p.proposedAmount).toLocaleString()}` : "--",
            submittedAgo: p.createdAt ? `Submitted ${new Date(p.createdAt).toLocaleDateString()}` : "Submitted",
            noteType: NOTE_TYPE_MAP[status] || "warn",
            noteText: status,
            matchScore: p.matchScore || 0,
            canWithdraw: status === "Pending",
          };
        }));
      })
      .catch((err) => setError(err.message || "Failed to load proposals."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total: proposals.length,
    pending: proposals.filter((p) => p.status === "Pending").length,
    accepted: proposals.filter((p) => p.status === "Accepted").length,
    successRate: proposals.length
      ? Math.round((proposals.filter((p) => p.status === "Accepted").length / proposals.length) * 100)
      : 0,
  }), [proposals]);

  const filtered = useMemo(() => proposals.filter((p) => p.status === activeTab), [proposals, activeTab]);

  const viewProps = {
    header: { title: "My Proposals", subtitle: "Track and manage your job applications" },
    stats: [
      { label: "Total Proposals", value: stats.total },
      { label: "Pending", value: stats.pending },
      { label: "Accepted", value: stats.accepted },
      { label: "Success Rate", value: `${stats.successRate}%` },
    ],
    tabs: { items: TABS, active: activeTab, onChange: setActiveTab },
    proposals: filtered,
    loading,
    error,
    onViewDetails: (id) => console.log("View details:", id),
    onWithdraw: async (proposalId) => {
      try {
        await proposalsService.withdraw(proposalId);
        setProposals((prev) =>
          prev.map((p) =>
            p.id === proposalId
              ? { ...p, status: "Withdrawn", canWithdraw: false, noteType: "muted", noteText: "Withdrawn" }
              : p
          )
        );
      } catch (err) {
        alert(err.message || "Failed to withdraw proposal.");
      }
    },
  };

  return (
    <div className="proposalsPage">
      <ProposalsView {...viewProps} />
    </div>
  );
}
