import { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { fetchLeaderboard } from "../api";

function formatTime(seconds) {
  if (!seconds) return "--:--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m + "m " + (s < 10 ? "0" + s : s) + "s";
}

const RANK_COLORS = { 1: "#ffd700", 2: "#c0c0c0", 3: "#cd7f32" };

export default function LeaderboardScreen() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await fetchLeaderboard();
      setBoard(data);
    } catch (e) {
      /* no-op */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#58a6ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fastest Escapes</Text>
      </View>
      {board.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No completions yet.</Text>
        </View>
      ) : (
        <FlatList
          data={board}
          keyExtractor={function (item) { return item._id; }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#58a6ff"
            />
          }
          renderItem={function ({ item }) {
            var rankColor = RANK_COLORS[item.rank] || "#8b949e";
            var rankLabel =
              item.rank <= 3
                ? ["", "1st", "2nd", "3rd"][item.rank]
                : "#" + item.rank;
            return (
              <View style={styles.row}>
                <View style={styles.rankCol}>
                  <Text style={[styles.rank, { color: rankColor }]}>
                    {rankLabel}
                  </Text>
                </View>
                <View style={styles.nameCol}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.email}>{item.email}</Text>
                </View>
                <Text style={styles.time}>
                  {formatTime(item.total_time_seconds)}
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0d1117" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 20, paddingBottom: 12 },
  title: { color: "#e6edf3", fontSize: 22, fontWeight: "700" },
  emptyText: { color: "#484f58", fontSize: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#21262d",
  },
  rankCol: { width: 50 },
  rank: { fontWeight: "700", fontSize: 15 },
  nameCol: { flex: 1 },
  name: { color: "#e6edf3", fontWeight: "600", fontSize: 15 },
  email: { color: "#484f58", fontSize: 12, marginTop: 2 },
  time: {
    color: "#3fb950",
    fontWeight: "600",
    fontSize: 15,
  },
});
