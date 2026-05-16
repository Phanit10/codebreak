import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { fetchCandidates, fetchCandidateReview } from "../api";

function formatTime(seconds) {
  if (!seconds) return "In progress";
  var m = Math.floor(seconds / 60);
  var s = Math.floor(seconds % 60);
  return m + "m " + (s < 10 ? "0" + s : s) + "s";
}

function formatTimestamp(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
}

export default function ReviewerScreen() {
  var [candidates, setCandidates] = useState([]);
  var [loading, setLoading] = useState(true);
  var [selectedId, setSelectedId] = useState(null);
  var [review, setReview] = useState(null);
  var [reviewLoading, setReviewLoading] = useState(false);

  useEffect(function () {
    setLoading(true);
    fetchCandidates()
      .then(function (data) { setCandidates(data); })
      .catch(function () {})
      .finally(function () { setLoading(false); });
  }, []);

  var selectCandidate = function (id) {
    setSelectedId(id);
    setReviewLoading(true);
    fetchCandidateReview(id)
      .then(function (data) { setReview(data); })
      .catch(function () { setReview(null); })
      .finally(function () { setReviewLoading(false); });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#58a6ff" />
      </View>
    );
  }

  if (!selectedId) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select a Candidate</Text>
        </View>
        <FlatList
          data={candidates}
          keyExtractor={function (item) { return item._id; }}
          renderItem={function ({ item }) {
            return (
              <TouchableOpacity
                style={styles.candidateRow}
                onPress={function () { selectCandidate(item._id); }}
              >
                <View style={styles.candidateInfo}>
                  <Text style={styles.candidateName}>{item.name}</Text>
                  <Text style={styles.candidateDetail}>
                    Puzzle {item.current_puzzle} / 3
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusDot,
                    item.is_completed ? styles.dotDone : styles.dotPending,
                  ]}
                />
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  }

  if (reviewLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#58a6ff" />
      </View>
    );
  }

  if (!review) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Could not load data.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={function () {
          setSelectedId(null);
          setReview(null);
        }}
      >
        <Text style={styles.backText}>Back to list</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{review.candidate.name}</Text>
        <Text style={styles.subtitle}>{review.candidate.email}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {formatTime(review.candidate.total_time_seconds)}
          </Text>
          <Text style={styles.statLabel}>TIME</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{review.summary.total_attempts}</Text>
          <Text style={styles.statLabel}>ATTEMPTS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#f85149" }]}>
            {review.summary.failed}
          </Text>
          <Text style={styles.statLabel}>FAILED</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#3fb950" }]}>
            {review.summary.passed}
          </Text>
          <Text style={styles.statLabel}>PASSED</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Attempt Timeline</Text>
      {review.attempts.map(function (a, i) {
        return (
          <View
            key={a._id}
            style={[
              styles.attemptCard,
              a.is_correct ? styles.attemptCorrect : styles.attemptIncorrect,
            ]}
          >
            <View style={styles.attemptHeader}>
              <Text style={styles.attemptNum}>#{i + 1}</Text>
              <Text style={styles.attemptPuzzle}>{a.puzzle_title}</Text>
              <View
                style={[
                  styles.badge,
                  a.is_correct ? styles.badgePass : styles.badgeFail,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: a.is_correct ? "#3fb950" : "#f85149" },
                  ]}
                >
                  {a.is_correct ? "PASS" : "FAIL"}
                </Text>
              </View>
            </View>
            <Text style={styles.attemptTime}>
              {formatTimestamp(a.submitted_at)}
            </Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{a.submission}</Text>
            </View>
          </View>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d1117",
  },
  header: { padding: 20, paddingBottom: 8 },
  title: { color: "#e6edf3", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#484f58", fontSize: 14, marginTop: 2 },
  emptyText: { color: "#484f58", fontSize: 16 },

  backBtn: { paddingHorizontal: 20, paddingTop: 16 },
  backText: { color: "#58a6ff", fontSize: 15, fontWeight: "600" },

  candidateRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
  },
  candidateInfo: { flex: 1 },
  candidateName: { color: "#e6edf3", fontSize: 16, fontWeight: "600" },
  candidateDetail: { color: "#484f58", fontSize: 13, marginTop: 2 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotDone: { backgroundColor: "#3fb950" },
  dotPending: { backgroundColor: "#d29922" },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1c2333",
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  statValue: { color: "#e6edf3", fontSize: 16, fontWeight: "700" },
  statLabel: {
    color: "#484f58",
    fontSize: 10,
    marginTop: 4,
  },

  sectionTitle: {
    color: "#8b949e",
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  attemptCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#1c2333",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
    overflow: "hidden",
  },
  attemptCorrect: { borderLeftWidth: 3, borderLeftColor: "#3fb950" },
  attemptIncorrect: { borderLeftWidth: 3, borderLeftColor: "#f85149" },

  attemptHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  attemptNum: { color: "#484f58", fontWeight: "700", fontSize: 13, marginRight: 8 },
  attemptPuzzle: { color: "#e6edf3", fontWeight: "600", fontSize: 14, flex: 1 },

  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99 },
  badgePass: { backgroundColor: "rgba(63,185,80,0.15)" },
  badgeFail: { backgroundColor: "rgba(248,81,73,0.15)" },
  badgeText: { fontSize: 11, fontWeight: "700" },

  attemptTime: {
    color: "#484f58",
    fontSize: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  codeBlock: {
    backgroundColor: "#0d1117",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#30363d",
  },
  codeText: { color: "#8b949e", fontFamily: "monospace", fontSize: 12 },
});
