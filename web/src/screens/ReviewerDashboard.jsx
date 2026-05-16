import { useState, useEffect } from "react";
import { fetchCandidates, fetchCandidateReview } from "../api";

function formatTime(seconds) {
  if (!seconds) return "In progress";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function formatTimestamp(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function ReviewerDashboard() {
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchCandidates()
      .then(setCandidates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selectCandidate = async (id) => {
    setSelected(id);
    setReviewLoading(true);
    try {
      const data = await fetchCandidateReview(id);
      setReview(data);
    } catch {
      setReview(null);
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="reviewer-container">
      <div className="reviewer-sidebar">
        <h3 className="sidebar-title">Candidates</h3>
        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          <div className="candidate-list">
            {candidates.map((c) => (
              <button
                key={c._id}
                className={`candidate-item ${selected === c._id ? "active" : ""}`}
                onClick={() => selectCandidate(c._id)}
              >
                <span className="candidate-name">{c.name}</span>
                <span className={`status-dot ${c.is_completed ? "done" : "pending"}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="reviewer-detail">
        {!selected ? (
          <div className="empty-state">
            Select a candidate to review their attempts.
          </div>
        ) : reviewLoading ? (
          <div className="loader">Loading review...</div>
        ) : review ? (
          <>
            <div className="review-header">
              <h2>{review.candidate.name}</h2>
              <span className="review-email">{review.candidate.email}</span>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">
                  {formatTime(review.candidate.total_time_seconds)}
                </span>
                <span className="stat-label">Total Time</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{review.summary.total_attempts}</span>
                <span className="stat-label">Total Attempts</span>
              </div>
              <div className="stat-card fail">
                <span className="stat-value">{review.summary.failed}</span>
                <span className="stat-label">Failed</span>
              </div>
              <div className="stat-card pass">
                <span className="stat-value">{review.summary.passed}</span>
                <span className="stat-label">Passed</span>
              </div>
            </div>

            <h3 className="section-title">Attempt Timeline</h3>
            <div className="attempts-timeline">
              {review.attempts.map((a, i) => (
                <div
                  key={a._id}
                  className={`attempt-card ${a.is_correct ? "correct" : "incorrect"}`}
                >
                  <div className="attempt-header">
                    <span className="attempt-number">#{i + 1}</span>
                    <span className="attempt-puzzle">{a.puzzle_title}</span>
                    <span className={`attempt-badge ${a.is_correct ? "pass" : "fail"}`}>
                      {a.is_correct ? "PASS" : "FAIL"}
                    </span>
                    <span className="attempt-time">
                      {formatTimestamp(a.submitted_at)}
                    </span>
                  </div>
                  <pre className="attempt-code">{a.submission}</pre>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">Could not load review data.</div>
        )}
      </div>
    </div>
  );
}
