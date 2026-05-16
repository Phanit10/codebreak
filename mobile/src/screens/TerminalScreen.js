import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  registerCandidate,
  fetchPuzzleByOrder,
  submitAttempt,
} from "../api";

export default function TerminalScreen() {
  var [user, setUser] = useState(null);
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [puzzle, setPuzzle] = useState(null);
  var [submission, setSubmission] = useState("");
  var [feedback, setFeedback] = useState(null);
  var [loading, setLoading] = useState(false);
  var [submitting, setSubmitting] = useState(false);
  var [completed, setCompleted] = useState(false);
  var [currentOrder, setCurrentOrder] = useState(1);

  useEffect(
    function () {
      if (!user || completed) return;
      setLoading(true);
      fetchPuzzleByOrder(currentOrder)
        .then(function (data) {
          if (data && !data.error) {
            setPuzzle(data);
            setSubmission(data.broken_code || "");
            setFeedback(null);
          } else {
            setCompleted(true);
          }
        })
        .catch(function () {
          setCompleted(true);
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [user, currentOrder, completed]
  );

  var handleLogin = function () {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Name and email are required");
      return;
    }
    setLoading(true);
    registerCandidate(name.trim(), email.trim())
      .then(function (data) {
        if (data && data._id) {
          setUser(data);
          setCurrentOrder(data.current_puzzle || 1);
          if (data.is_completed) setCompleted(true);
        } else {
          Alert.alert("Error", "Could not connect to server");
        }
      })
      .finally(function () {
        setLoading(false);
      });
  };

  var handleSubmit = function () {
    if (!submission.trim() || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    submitAttempt(user._id, puzzle._id, submission)
      .then(function (result) {
        if (!result) {
          setFeedback({ correct: false, message: "Connection error." });
          return;
        }
        setFeedback(result);
        if (result.correct) {
          if (result.completed) {
            setCompleted(true);
          } else {
            setTimeout(function () {
              setCurrentOrder(result.next_puzzle);
            }, 1500);
          }
        }
      })
      .finally(function () {
        setSubmitting(false);
      });
  };

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.brandIcon}>{">_"}</Text>
        <Text style={styles.loginTitle}>CodeBreak</Text>
        <Text style={styles.loginSub}>Escape the broken code.</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor="#484f58"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#484f58"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.btnPrimaryText}>
            {loading ? "Connecting..." : "Enter the Room"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#58a6ff" />
      </View>
    );
  }

  if (completed) {
    return (
      <View style={styles.center}>
        <Text style={styles.completeIcon}>&#10003;</Text>
        <Text style={styles.completeTitle}>Room Escaped!</Text>
        <Text style={styles.completeSub}>
          You solved all puzzles. Check the Leaderboard!
        </Text>
      </View>
    );
  }

  if (!puzzle) {
    return (
      <View style={styles.center}>
        <Text style={styles.mutedText}>No puzzle found.</Text>
      </View>
    );
  }

  var diffColor =
    puzzle.difficulty === "easy"
      ? "#3fb950"
      : puzzle.difficulty === "medium"
      ? "#d29922"
      : "#f85149";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.termHeader}>
          <View style={styles.dots}>
            <View style={[styles.dot, { backgroundColor: "#f85149" }]} />
            <View style={[styles.dot, { backgroundColor: "#d29922" }]} />
            <View style={[styles.dot, { backgroundColor: "#3fb950" }]} />
          </View>
          <Text style={styles.termTitle}>
            puzzle_{puzzle.order}.sh
          </Text>
          <Text style={styles.progress}>{puzzle.order} / 3</Text>
        </View>

        <View style={styles.body}>
          <View
            style={[
              styles.diffBadge,
              { backgroundColor: diffColor + "20" },
            ]}
          >
            <Text style={[styles.diffText, { color: diffColor }]}>
              {puzzle.difficulty.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.puzzleTitle}>{puzzle.title}</Text>

          <Text style={styles.label}>MISSION BRIEF</Text>
          <Text style={styles.description}>{puzzle.description}</Text>

          <Text style={styles.label}>BROKEN CODE</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.brokenCode}>{puzzle.broken_code}</Text>
          </View>

          <Text style={styles.label}>YOUR FIX</Text>
          <TextInput
            style={styles.editor}
            value={submission}
            onChangeText={setSubmission}
            multiline={true}
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
          />

          {feedback && (
            <View
              style={[
                styles.feedback,
                feedback.correct ? styles.feedbackPass : styles.feedbackFail,
              ]}
            >
              <Text style={styles.feedbackText}>{feedback.message}</Text>
              {feedback.hint && (
                <Text style={styles.hintText}>Hint: {feedback.hint}</Text>
              )}
              {feedback.attempts_so_far && (
                <Text style={styles.attemptsText}>
                  Failed attempts: {feedback.attempts_so_far}
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.btnSubmit}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={styles.btnSubmitText}>
              {submitting ? "Verifying..." : "$ submit --verify"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

var styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d1117",
    padding: 20,
  },

  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d1117",
    padding: 30,
  },
  brandIcon: {
    fontFamily: "monospace",
    fontSize: 36,
    color: "#3fb950",
    marginBottom: 8,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e6edf3",
    marginBottom: 4,
  },
  loginSub: {
    fontSize: 15,
    color: "#8b949e",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#e6edf3",
    marginBottom: 10,
  },
  btnPrimary: {
    width: "100%",
    backgroundColor: "#58a6ff",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  btnPrimaryText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },

  completeIcon: { fontSize: 48, color: "#3fb950", marginBottom: 12 },
  completeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#e6edf3",
    marginBottom: 8,
  },
  completeSub: { fontSize: 15, color: "#8b949e", textAlign: "center" },
  mutedText: { fontSize: 16, color: "#484f58" },

  termHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c2333",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#30363d",
  },
  dots: { flexDirection: "row", marginRight: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 5 },
  termTitle: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 12,
    color: "#8b949e",
  },
  progress: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#58a6ff",
    fontWeight: "600",
  },

  body: { padding: 16 },
  diffBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
    marginBottom: 8,
  },
  diffText: { fontSize: 11, fontWeight: "700" },
  puzzleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#e6edf3",
    marginBottom: 16,
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#484f58",
    marginBottom: 6,
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: "#8b949e",
    lineHeight: 20,
    marginBottom: 16,
  },

  codeBlock: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  brokenCode: {
    fontFamily: "monospace",
    fontSize: 13,
    color: "#f85149",
    lineHeight: 20,
  },

  editor: {
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    borderRadius: 8,
    padding: 12,
    fontFamily: "monospace",
    fontSize: 13,
    color: "#3fb950",
    lineHeight: 20,
    minHeight: 180,
    textAlignVertical: "top",
    marginBottom: 16,
  },

  feedback: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  feedbackPass: {
    backgroundColor: "rgba(63,185,80,0.1)",
    borderColor: "#3fb950",
  },
  feedbackFail: {
    backgroundColor: "rgba(248,81,73,0.1)",
    borderColor: "#f85149",
  },
  feedbackText: { fontSize: 14, color: "#e6edf3" },
  hintText: { fontSize: 13, color: "#d29922", marginTop: 4 },
  attemptsText: { fontSize: 12, color: "#484f58", marginTop: 2 },

  btnSubmit: {
    backgroundColor: "#3fb950",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  btnSubmitText: {
    fontFamily: "monospace",
    fontSize: 15,
    fontWeight: "600",
    color: "#000000",
  },
});
