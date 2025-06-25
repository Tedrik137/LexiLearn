import { LanguageCode } from "./languages";

export type HistoryItem = {
  id?: string;
  userId: string;
  language: LanguageCode;
  name: string;
  score: number;
  mode: "Practice" | "Test";
  date: string;
  difficulty: string;
};
