import "react-native-url-polyfill/auto";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import TerminalScreen from "./src/screens/TerminalScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import ReviewerScreen from "./src/screens/ReviewerScreen";

const TABS = [
  { key: "terminal", label: "Terminal", icon: "💻" },
  { key: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { key: "reviewer", label: "Reviewer", icon: "📋" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("terminal");

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#161b22" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>CodeBreak</Text>
      </View>

      <View style={styles.content}>
        {activeTab === "terminal" ? (
          <TerminalScreen />
        ) : activeTab === "leaderboard" ? (
          <LeaderboardScreen />
        ) : (
          <ReviewerScreen />
        )}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  header: {
    backgroundColor: "#161b22",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#30363d",
  },
  headerTitle: {
    color: "#e6edf3",
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#161b22",
    borderTopWidth: 1,
    borderTopColor: "#30363d",
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    color: "#8b949e",
    fontSize: 12,
  },
  tabLabelActive: {
    color: "#58a6ff",
  },
});
