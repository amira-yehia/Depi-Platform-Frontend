import { useEffect, useState } from "react";
import "./ContractsMilestonesPage.css";
import { contractsService } from "../services/api";

// Status mapping from API integers to readable labels
const MILESTONE_STATUS = { 0: "pending", 1: "active", 2: "done", 3: "done", 4: "pending" };

function MilestoneItem({ milestone }) {
  const status = typeof milestone.status === "number"
    ? (MILESTONE_STATUS[milestone.status] || "pending")
    : (milestone.status || "pending");

  const iconClass = status === "done"
    ? "fa-regular fa-circle-check"
    : status === "active"
    ? "fa-regular fa-circle-dot"
    : "fa-regular fa-circle";

  return (
    <li className={`milestoneItem milestoneItem--${status}`}>
      <div className="milestoneItem__content">
        <i className={iconClass} aria-hidden="true" />
        <div>
          <h4>{milestone.title}</h4>
          <p>{milestone.dueDate ? new Date(milestone.dueDate).toLocaleDateString() : milestone.date}</p>
          {status === "active" && (
            <button type="button" className="milestoneItem__action">Submit Deliverable</button>
          )}
        </div>
      </div>
      {milestone.amount && <strong>${Number(milestone.amount).toLocaleString()}</strong>}
    </li>
  );
}

function ContractMilestoneCard({ contract }) {
  const safeProgress = Math.min(Math.max(Number(contract.progress) || 0, 0), 100);

  return (
    <article className="contractMilestoneCard">
      <header className="contractMilestoneCard__header">
        <div>
          <h2>{contract.title}</h2>
          <p>Client: {contract.client || "N/A"}</p>
          {contract.startDate && <span>Started {new Date(contract.startDate).toLocaleDateString()}</span>}
        </div>
        <div className="contractMilestoneCard__money">
          <strong>${(contract.earned || 0).toLocaleString()}</strong>
          <span>of ${(contract.total || 0).toLocaleString()}</span>
        </div>
      </header>

      <div className="contractMilestoneCard__progress">
        <div className="contractMilestoneCard__progressTop">
          <span>Overall progress</span>
          <strong>{safeProgress}%</strong>
        </div>
        <div className="contractMilestoneCard__progressTrack">
          <span className="contractMilestoneCard__progressFill" style={{ width: `${safeProgress}%` }} />
        </div>
      </div>

      {contract.milestones?.length > 0 && (
        <section className="contractMilestoneCard__milestones">
          <h3>Milestones</h3>
          <ul>
            {contract.milestones.map((ms) => <MilestoneItem key={ms.id} milestone={ms} />)}
          </ul>
        </section>
      )}
    </article>
  );
}

export default function ContractsMilestonesPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    contractsService.myContracts()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        // Normalize API response — field names may vary
        const normalized = list.map((c) => ({
          id: c.id,
          title: c.title || c.projectTitle || "Contract",
          client: c.clientName || c.client || "Client",
          startDate: c.startDate || c.startedAt || c.createdAt,
          earned: c.earnedAmount || c.paidAmount || 0,
          total: c.totalAmount || c.amount || 0,
          progress: c.progress || c.completionPercentage || 0,
          milestones: Array.isArray(c.milestones) ? c.milestones : [],
        }));
        setContracts(normalized);
      })
      .catch((err) => setError(err.message || "Failed to load contracts."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="contractsPage">
        <div className="contractsPage__container">
          <p style={{ color: "#aaa", padding: "2rem" }}>Loading contracts...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="contractsPage">
        <div className="contractsPage__container">
          <p style={{ color: "#f87171", padding: "2rem" }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="contractsPage">
      <div className="contractsPage__container">
        <header className="contractsPage__header">
          <h1>Contracts & Milestones</h1>
          <p>Track your active projects and deliverables.</p>
        </header>

        {contracts.length === 0 ? (
          <div className="contractsPage__empty" style={{ color: "#aaa", textAlign: "center", padding: "3rem" }}>
            <i className="fa-solid fa-file-contract" style={{ fontSize: "3rem", marginBottom: "1rem", display: "block" }} />
            <p>No contracts yet. Start by accepting a proposal!</p>
          </div>
        ) : (
          <div className="contractsPage__list">
            {contracts.map((contract) => (
              <ContractMilestoneCard key={contract.id} contract={contract} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
