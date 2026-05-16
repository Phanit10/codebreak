// For Android emulator: 10.0.2.2 maps to host machine's localhost
// For physical device: replace with your computer's local IP address
const BASE = "http://10.0.2.2:5000";

export async function fetchLeaderboard() {
  try {
    const res = await fetch(BASE + "/leaderboard");
    return await res.json();
  } catch (e) {
    console.warn("fetchLeaderboard error:", e);
    return [];
  }
}

export async function fetchCandidates() {
  try {
    const res = await fetch(BASE + "/reviewer/candidates");
    return await res.json();
  } catch (e) {
    console.warn("fetchCandidates error:", e);
    return [];
  }
}

export async function fetchCandidateReview(candidateId) {
  try {
    const res = await fetch(BASE + "/reviewer/candidate/" + candidateId);
    return await res.json();
  } catch (e) {
    console.warn("fetchCandidateReview error:", e);
    return null;
  }
}

export async function registerCandidate(name, email) {
  try {
    const res = await fetch(BASE + "/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, email: email }),
    });
    return await res.json();
  } catch (e) {
    console.warn("registerCandidate error:", e);
    return null;
  }
}

export async function fetchPuzzleByOrder(order) {
  try {
    const res = await fetch(BASE + "/puzzles/order/" + order);
    return await res.json();
  } catch (e) {
    console.warn("fetchPuzzleByOrder error:", e);
    return null;
  }
}

export async function submitAttempt(candidateId, puzzleId, submission) {
  try {
    const res = await fetch(BASE + "/submit-attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        puzzle_id: puzzleId,
        submission: submission,
      }),
    });
    return await res.json();
  } catch (e) {
    console.warn("submitAttempt error:", e);
    return null;
  }
}
