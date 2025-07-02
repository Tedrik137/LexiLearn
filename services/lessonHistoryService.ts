import { firestore } from "@/firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { LanguageCode } from "@/types/languages";
import { HistoryItem } from "@/types/lessonHistory";

interface LessonHistoryResult {
  success: boolean;
  history?: HistoryItem[];
  error?: string;
}

const LESSON_HISTORY_COLLECTION = "lessonHistory";

class LessonHistoryService {
  private firestore = firestore;

  async fetchLessonHistory(
    uid: string,
    languageCode?: LanguageCode // Optional: if you want to filter by language
  ): Promise<LessonHistoryResult> {
    if (!uid) {
      console.error("UID is required to fetch lesson history.");
      return {
        success: false,
        error: "UID is required to fetch lesson history.",
      };
    }
    try {
      const historyCollectionRef = collection(
        this.firestore,
        LESSON_HISTORY_COLLECTION
      );
      let q = query(
        historyCollectionRef,
        where("userId", "==", uid),
        orderBy("date", "desc")
      );

      if (languageCode) {
        q = query(
          historyCollectionRef,
          where("userId", "==", uid),
          where("languageCode", "==", languageCode),
          orderBy("date", "desc")
        );
      }

      const querySnapshot = await getDocs(q);
      const history: HistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() } as HistoryItem);
      });
      return { success: true, history };
    } catch (error) {
      console.error("Error fetching lesson history:", error);
      return {
        success: false,
        error: `Error fetching lesson history: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }

  async addLessonEntry(
    entryData: Omit<HistoryItem, "id" | "date">
  ): Promise<LessonHistoryResult> {
    if (!entryData.userId) {
      console.error("UID is required to add a lesson entry.");
      return {
        success: false,
        error: "UID is required to add a lesson entry.",
      };
    }
    try {
      const historyCollectionRef = collection(
        this.firestore,
        LESSON_HISTORY_COLLECTION
      );

      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
      const yyyy = today.getFullYear();
      const todayString = dd + "/" + mm + "/" + yyyy;

      await addDoc(historyCollectionRef, {
        ...entryData,
        date: todayString,
      });
      return { success: true };
    } catch (error) {
      console.error("Error adding lesson entry:", error);
      return {
        success: false,
        error: `Error adding lesson entry: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  }
}

export default new LessonHistoryService();
