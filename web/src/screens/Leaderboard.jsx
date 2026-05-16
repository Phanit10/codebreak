import { useState, useEffect } from "react";
import { fetchLeaderboard } from "../api";

function formatTime(seconds) {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

const RANK_STYLE = { 1: "gold", 2: "silver", 3: "bronze" };

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(setBoard)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <h2>Leaderboard</h2>
          <p className="leaderboard-subtitle">Fastest escape times</p>
        </div>

        {loading ? (
          <div className="loader">Loading...</div>
        ) : board.length === 0 ? (
          <div className="empty-state">
            No completions yet. Be the first to escape!
          </div>
        ) : (
          <div className="leaderboard-list">
            {board.map((entry) => (
              <div
                key={entry._id}
                className={`leaderboard-row ${RANK_STYLE[entry.rank] || ""}`}
              >
                <div className="rank-cell">
                  <span className={`rank-badge ${RANK_STYLE[entry.rank] || ""}`}>
                    {entry.rank <= 3 ? ["", "1st", "2nd", "3rd"][entry.rank] : `#${entry.rank}`}
                  </span>
                </div>
                <div className="name-cell">
                  <span className="candidate-name">{entry.name}</span>
                  <span className="candidate-email">{entry.email}</span>
                </div>
                <div className="time-cell">
                  <span className="time-value">
                    {formatTime(entry.total_time_seconds)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
