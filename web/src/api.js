const BASE = "/api";

export async function fetchPuzzleByOrder(order) {
  const res = await fetch(`${BASE}/puzzles/order/${order}`);
  if (!res.ok) throw new Error("Puzzle not found");
  return res.json();
}

export async function submitAttempt(candidateId, puzzleId, submission) {
  const res = await fetch(`${BASE}/submit-attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      candidate_id: candidateId,
      puzzle_id: puzzleId,
      submission,
    }),
  });
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${BASE}/leaderboard`);
  return res.json();
}

export async function fetchCandidates() {
  const res = await fetch(`${BASE}/reviewer/candidates`);
  return res.json();
}

export async function fetchCandidateReview(candidateId) {
  const res = await fetch(`${BASE}/reviewer/candidate/${candidateId}`);
  return res.json();
}

export async function registerCandidate(name, email) {
  const res = await fetch(`${BASE}/candidates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email }),
  });
  return res.json();
}
