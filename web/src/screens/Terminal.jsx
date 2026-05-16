import { useState, useEffect } from "react";
import { fetchPuzzleByOrder, submitAttempt } from "../api";

export default function Terminal({ user }) {
  const [puzzle, setPuzzle] = useState(null);
  const [submission, setSubmission] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(user.is_completed || false);
  const [currentOrder, setCurrentOrder] = useState(user.current_puzzle || 1);

  useEffect(() => {
    if (completed) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchPuzzleByOrder(currentOrder)
      .then((data) => {
        setPuzzle(data);
        setSubmission(data.broken_code || "");
        setFeedback(null);
      })
      .catch(() => {
        setCompleted(true);
      })
      .finally(() => setLoading(false));
  }, [currentOrder, completed]);

  const handleSubmit = async () => {
    if (!submission.trim() || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await submitAttempt(user._id, puzzle._id, submission);
      setFeedback(result);
      if (result.correct) {
        if (result.completed) {
          setCompleted(true);
        } else {
          setTimeout(() => {
            setCurrentOrder(result.next_puzzle);
          }, 1500);
        }
      }
    } catch {
      setFeedback({ correct: false, message: "Connection error. Try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const newVal =
        submission.substring(0, selectionStart) +
        "  " +
        submission.substring(selectionEnd);
      setSubmission(newVal);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
      }, 0);
    }
  };

  if (loading) {
    return (
      <div className="terminal-container">
        <div className="terminal-window">
          <div className="terminal-loader">Loading puzzle...</div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="terminal-container">
        <div className="terminal-window">
          <div className="terminal-complete">
            <div className="complete-icon">&#10003;</div>
            <h2>Room Escaped!</h2>
            <p>You've solved all puzzles. Check the leaderboard for your ranking.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="terminal-container">
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <span className="terminal-title">
            puzzle_{puzzle.order}.sh — CodeBreak Terminal
          </span>
          <span className="puzzle-progress">
            {puzzle.order} / 3
          </span>
        </div>

        <div className="terminal-body">
          <div className="puzzle-meta">
            <span className={`difficulty-badge ${puzzle.difficulty}`}>
              {puzzle.difficulty}
            </span>
            <h2 className="puzzle-title">{puzzle.title}</h2>
          </div>

          <div className="prompt-section">
            <span className="prompt-label">MISSION BRIEF</span>
            <p className="prompt-text">{puzzle.description}</p>
          </div>

          <div className="code-section">
            <span className="prompt-label">BROKEN CODE</span>
            <pre className="broken-code">{puzzle.broken_code}</pre>
          </div>

          <div className="editor-section">
            <span className="prompt-label">YOUR FIX</span>
            <textarea
              className="code-editor"
              value={submission}
              onChange={(e) => setSubmission(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              rows={12}
            />
          </div>

          {feedback && (
            <div className={`feedback ${feedback.correct ? "success" : "error"}`}>
              <span className="feedback-icon">
                {feedback.correct ? "+" : "x"}
              </span>
              <div className="feedback-body">
                <p>{feedback.message}</p>
                {feedback.hint && (
                  <p className="feedback-hint">Hint: {feedback.hint}</p>
                )}
                {feedback.attempts_so_far && (
                  <p className="feedback-attempts">
                    Failed attempts: {feedback.attempts_so_far}
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Verifying..." : "$ submit --verify"}
          </button>
        </div>
      </div>
    </div>
  );
}
