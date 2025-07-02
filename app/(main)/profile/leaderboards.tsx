import CustomScrollView from "@/components/CustomScrollView";
import { useEffect, useState } from "react";
import LeaderboardService from "@/services/leaderboardService";
import { ThemedView } from "@/components/ThemedView";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { LeaderboardItem } from "@/types/leaderboard";
import { v4 as uuidv4 } from "uuid";
import { IconSymbol } from "@/components/ui/IconSymbol";

type LeaderboardPeriodScore = {
  weekly: LeaderboardItem[];
  monthly: LeaderboardItem[];
  allTime: LeaderboardItem[];
};

export default function LeaderboardsScreen() {
  const [periodScore, setPeriodScore] = useState<LeaderboardPeriodScore>({
    weekly: [],
    monthly: [],
    allTime: [],
  });
  const [period, setPeriod] = useState<"weekly" | "monthly" | "allTime">(
    "allTime"
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (periodScore[period].length === 0) {
      fetchLeaderboardData(period);
    }
  }, [period]);

  const fetchLeaderboardData = async (
    period: "weekly" | "monthly" | "allTime"
  ) => {
    setLoading(true);
    try {
      LeaderboardService.getLeaderboardData(period).then((result) => {
        if (result.success) {
          setPeriodScore((prev) => ({
            ...prev,
            [period]: result.leaderboardData || [],
          }));
        } else {
          console.error("Error fetching leaderboard data:", result.error);
        }
      });
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLeaderboard = () => {
    setLoading(true);
    setTimeout(() => {
      fetchLeaderboardData(period);
      setLoading(false);
    }, 1000); // Simulate a short loading time
  };

  return (
    <CustomScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      canPopNavigation={true}
      padding={8}
      marginTop={24}
    >
      <ThemedView style={[styles.container]}>
        <ThemedView style={[styles.periodSelector]}>
          <Pressable
            onPress={() => setPeriod("weekly")}
            style={{
              backgroundColor: period === "weekly" ? "#A1CEDC" : "transparent",
              borderRadius: 4,
            }}
          >
            <ThemedText
              style={{
                color: period === "weekly" ? "#000" : "#666",
                fontWeight: "bold",
                padding: 8,
              }}
            >
              Weekly
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setPeriod("monthly")}
            style={{
              backgroundColor: period === "monthly" ? "#A1CEDC" : "transparent",
              borderRadius: 4,
            }}
          >
            <ThemedText
              style={{
                color: period === "monthly" ? "#000" : "#666",
                fontWeight: "bold",
                padding: 8,
              }}
            >
              Monthly
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setPeriod("allTime")}
            style={{
              backgroundColor: period === "allTime" ? "#A1CEDC" : "transparent",

              borderRadius: 4,
            }}
          >
            <ThemedText
              style={{
                color: period === "allTime" ? "#000" : "#666",
                fontWeight: "bold",
                padding: 8,
              }}
            >
              All Time
            </ThemedText>
          </Pressable>
        </ThemedView>
        <ThemedView style={[styles.header]}>
          <ThemedText style={[styles.headerText, styles.rank]}>Rank</ThemedText>
          <ThemedText style={[styles.headerText, styles.displayName]}>
            Display Name
          </ThemedText>
          <ThemedText style={[styles.headerText, styles.completedQuizzes]}>
            {period.charAt(0).toUpperCase() + period.slice(1)} Completed Quizzes
          </ThemedText>
          <Pressable onPress={refreshLeaderboard} style={[styles.refresh]}>
            <IconSymbol
              size={26}
              name="goforward"
              color={loading ? "#ccc" : "gray"}
            />
          </Pressable>
        </ThemedView>

        {loading ? (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <ThemedText style={styles.loadingText}>Loading...</ThemedText>
          </ThemedView>
        ) : periodScore[period].length > 0 ? (
          periodScore[period].map((item, index) => (
            <ThemedView key={item.userId || uuidv4()} style={[styles.row]}>
              <ThemedText style={[styles.rowText, styles.rank]}>
                {`${index + 1}.`}
              </ThemedText>
              <ThemedText style={[styles.rowText, styles.displayName]}>
                {`${item.displayName || "Anonymous"}`}
              </ThemedText>
              <ThemedText style={[styles.rowText, styles.completedQuizzes]}>
                {item[`${period}Score`] || 0}
              </ThemedText>
            </ThemedView>
          ))
        ) : (
          <ThemedView style={styles.emptyHistoryContainer}>
            <ThemedText style={styles.emptyHistoryText}>
              No leaderboard data available.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  header: {
    backgroundColor: "#A1CEDC",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 2,
    borderColor: "#ddd", // Consider using a theme-aware color
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    paddingHorizontal: 4,
  },

  rowText: {
    fontSize: 12,
    textAlign: "left",
    paddingHorizontal: 4,
  },
  // Column specific flex styles
  rank: { flex: 1 },
  displayName: { flex: 2 },
  completedQuizzes: { flex: 3 },
  refresh: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    textAlign: "center", // Ensure text within centers if multiple lines
  },
  emptyHistoryText: {
    fontSize: 18, // Made it slightly larger
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8, // Added margin for subtext
  },
  emptyHistorySubText: {
    // Style for the new subtext
    fontSize: 14,
    textAlign: "center",
  },
  periodSelector: {
    flexDirection: "row",
    justifyContent: "flex-start",
    backgroundColor: "#E0F7FA", // Lighter background for the selector
    borderRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // For Android shadow
    width: 218,
  },
});
