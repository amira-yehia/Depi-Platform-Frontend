import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./ProjectDetailsPage.css";
import { jobsService, proposalsService, aiService } from "../services/api";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Proposal form
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [proposedTimeline, setProposedTimeline] = useState("");
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyType, setApplyType] = useState("idle");

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);

    Promise.all([
      jobsService.get(projectId),
      aiService.jobLocalAnalysis(projectId).catch(() => null),
    ])
      .then(([jobData, analysisData]) => {
        setJob(jobData);
        setAnalysis(analysisData);
      })
      .catch((err) => setError(err.message || "Failed to load job details."))
      .finally(() => setLoading(false));
  }, [projectId]);

  async function handleApply(e) {
    e.preventDefault();
    setApplying(true);
    setApplyMessage("");
    try {
      await jobsService.apply(projectId, coverLetter, proposedRate, proposedTimeline);
      setApplyMessage("Application submitted successfully!");
      setApplyType("success");
      setShowApply(false);
    } catch (err) {
      setApplyMessage(err.message || "Failed to submit application.");
      setApplyType("error");
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="projectDetailsPage">
        <div className="projectDetailsPage__container">
          <p style={{ color: "var(--text-secondary, #aaa)", padding: "2rem" }}>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="projectDetailsPage">
        <div className="projectDetailsPage__container">
          <button onClick={() => navigate(-1)} className="projectDetailsPage__back">← Back</button>
          <p style={{ color: "#f87171", padding: "2rem" }}>{error || "Job not found."}</p>
        </div>
      </div>
    );
  }

  const tags = job.skillsRequired
    ? job.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="projectDetailsPage">
      <div className="projectDetailsPage__container">
        <button onClick={() => navigate(-1)} className="projectDetailsPage__back">← Back to Jobs</button>

        <div className="projectDetailsPage__layout">
          {/* Main content */}
          <main className="projectDetailsPage__main">
            <div className="projectDetailsPage__header">
              <h1>{job.title}</h1>
              <div className="projectDetailsPage__meta">
                <span><i className="fa-solid fa-map-marker-alt" /> {job.isRemote ? "Remote" : (job.location || "On-site")}</span>
                <span><i className="fa-regular fa-clock" /> Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently"}</span>
                <span><i className="fa-solid fa-users" /> {job.applicationsCount || 0} applicants</span>
              </div>
            </div>

            <div className="projectDetailsPage__card">
              <h2>Job Description</h2>
              <p>{job.description}</p>
            </div>

            {tags.length > 0 && (
              <div className="projectDetailsPage__card">
                <h2>Required Skills</h2>
                <div className="projectDetailsPage__tags">
                  {tags.map((tag) => <span key={tag} className="projectDetailsPage__tag">{tag}</span>)}
                </div>
              </div>
            )}

            {analysis && (
              <div className="projectDetailsPage__card projectDetailsPage__analysis">
                <h2>AI Analysis</h2>
                <div className="projectDetailsPage__matchScore">
                  <span className="projectDetailsPage__matchPct">{analysis.matchPercentage || 0}%</span>
                  <span>{analysis.matchLevel || "Match"}</span>
                </div>
                {analysis.fitSummary && <p>{analysis.fitSummary}</p>}
                {analysis.recommendationDecision && (
                  <p><strong>Recommendation:</strong> {analysis.recommendationDecision}</p>
                )}
                {analysis.applicationTips && analysis.applicationTips.length > 0 && (
                  <div>
                    <strong>Tips:</strong>
                    <ul>{analysis.applicationTips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                  </div>
                )}
                {analysis.pricingAdvice && <p><strong>Pricing:</strong> {analysis.pricingAdvice}</p>}
              </div>
            )}

            {/* Apply form */}
            {!job.hasApplied && (
              <>
                {!showApply ? (
                  <button className="projectDetailsPage__applyBtn" onClick={() => setShowApply(true)}>
                    Apply Now
                  </button>
                ) : (
                  <form className="projectDetailsPage__card projectDetailsPage__applyForm" onSubmit={handleApply}>
                    <h2>Submit Application</h2>
                    <label>
                      Cover Letter
                      <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the client why you're a great fit..." rows={5} required />
                    </label>
                    <label>
                      Proposed Rate / Budget ($)
                      <input type="text" value={proposedRate} onChange={(e) => setProposedRate(e.target.value)} placeholder="e.g. 5000" />
                    </label>
                    <label>
                      Proposed Timeline
                      <input type="text" value={proposedTimeline} onChange={(e) => setProposedTimeline(e.target.value)} placeholder="e.g. 2 weeks" />
                    </label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <button type="submit" className="projectDetailsPage__applyBtn" disabled={applying}>
                        {applying ? "Submitting..." : "Submit Application"}
                      </button>
                      <button type="button" onClick={() => setShowApply(false)} style={{ background: "transparent", border: "1px solid #444", color: "#aaa", padding: "0.75rem 1.5rem", borderRadius: "8px", cursor: "pointer" }}>
                        Cancel
                      </button>
                    </div>
                    {applyMessage && <p style={{ color: applyType === "success" ? "#4ade80" : "#f87171" }}>{applyMessage}</p>}
                  </form>
                )}
              </>
            )}

            {job.hasApplied && (
              <div className="projectDetailsPage__card" style={{ borderColor: "#4ade80" }}>
                <p style={{ color: "#4ade80" }}>✅ You have already applied to this job.</p>
              </div>
            )}

            {applyMessage && !showApply && (
              <p style={{ color: applyType === "success" ? "#4ade80" : "#f87171", padding: "1rem" }}>{applyMessage}</p>
            )}
          </main>

          {/* Sidebar */}
          <aside className="projectDetailsPage__sidebar">
            <div className="projectDetailsPage__card">
              <h3>Budget</h3>
              <p className="projectDetailsPage__budget">
                ${(job.budgetMin || 0).toLocaleString()} – ${(job.budgetMax || 0).toLocaleString()}
              </p>
              <p style={{ color: "#aaa", fontSize: "0.85rem" }}>{job.budgetType || "Fixed"}</p>
            </div>

            <div className="projectDetailsPage__card">
              <h3>Details</h3>
              <ul style={{ listStyle: "none", padding: 0, lineHeight: 2 }}>
                <li><i className="fa-solid fa-star" style={{ color: "#f59e0b", marginRight: 8 }} />{job.experienceLevel || "Intermediate"}</li>
                <li><i className="fa-solid fa-map-marker-alt" style={{ color: "#60a5fa", marginRight: 8 }} />{job.isRemote ? "Remote" : (job.location || "On-site")}</li>
                {job.expiresAt && (
                  <li><i className="fa-regular fa-calendar" style={{ color: "#a78bfa", marginRight: 8 }} />Expires {new Date(job.expiresAt).toLocaleDateString()}</li>
                )}
              </ul>
            </div>

            {analysis?.suggestedBidMin && (
              <div className="projectDetailsPage__card">
                <h3>Suggested Bid Range</h3>
                <p style={{ color: "#4ade80", fontWeight: "bold" }}>
                  ${analysis.suggestedBidMin.toLocaleString()} – ${analysis.suggestedBidMax.toLocaleString()}
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
