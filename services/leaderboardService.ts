import { firestore } from "@/firebaseConfig";
import { LeaderboardItem } from "@/types/leaderboard";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore";

const LEADERBOARD_COLLECTION = "leaderboard";

type LeaderboardDocumentResult = {
  success: boolean;
  leaderboardData?: LeaderboardItem[];
  error?: string;
};

class LeaderboardService {
  private firestore = firestore;

  async getLeaderboardData(
    period: "weekly" | "monthly" | "allTime"
  ): Promise<LeaderboardDocumentResult> {
    try {
      const leaderboardRef = collection(this.firestore, LEADERBOARD_COLLECTION);
      const q = query(
        leaderboardRef,
        orderBy(`${period}Score`, "desc"),
        limit(100)
      );

      const querySnapshot = await getDocs(q);

      const leaderboardData: LeaderboardItem[] = querySnapshot.docs.map(
        (doc) => {
          const data = doc.data() as LeaderboardItem;
          return {
            userId: data.userId,
            displayName: data.displayName,
            weeklyScore: data.weeklyScore,
            monthlyScore: data.monthlyScore,
            allTimeScore: data.allTimeScore,
          };
        }
      );

      return { success: true, leaderboardData };
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      return { success: false, error: "Failed to fetch leaderboard data." };
    }
  }
}

export default new LeaderboardService();
