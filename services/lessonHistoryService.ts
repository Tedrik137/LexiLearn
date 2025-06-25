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

const LESSON_HISTORY_COLLECTION = "lessonHistory";

export const LessonHistoryService = {
  fetchLessonHistory: async (
    uid: string,
    languageCode?: LanguageCode // Optional: if you want to filter by language
  ): Promise<HistoryItem[]> => {
    if (!uid) {
      console.error("UID is required to fetch lesson history.");
      return [];
    }
    try {
      const historyCollectionRef = collection(
        firestore,
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
      return history;
    } catch (error) {
      console.error("Error fetching lesson history:", error);
      throw error; // Or return empty array / handle error as needed
    }
  },

  addLessonEntry: async (
    entryData: Omit<HistoryItem, "id" | "date">
  ): Promise<string | null> => {
    if (!entryData.userId) {
      console.error("UID is required to add a lesson entry.");
      return null;
    }
    try {
      const historyCollectionRef = collection(
        firestore,
        LESSON_HISTORY_COLLECTION
      );

      const today = new Date();
      const dd = String(today.getDate()).padStart(2, "0");
      const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
      const yyyy = today.getFullYear();
      const todayString = dd + "/" + mm + "/" + yyyy;

      const docRef = await addDoc(historyCollectionRef, {
        ...entryData,
        date: todayString,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding lesson entry:", error);
      throw error;
    }
  },
};
