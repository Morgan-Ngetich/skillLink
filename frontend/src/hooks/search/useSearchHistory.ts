import { safeLocalStorage } from "@/utils/storage";
import { useState, useEffect } from "react";

const HISTORY_KEY = "searchHistory";
const MAX_HISTORY = 10;

export const useSearchHistory = () => {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(safeLocalStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(Array.isArray(stored) ? stored : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const addToHistory = (query: string) => {
    const newHistory = [query, ...history.filter((h) => h !== query)].slice(0, MAX_HISTORY);
    setHistory(newHistory);
    safeLocalStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    safeLocalStorage.setItem(HISTORY_KEY, "[]");
  };

  return { history, addToHistory, clearHistory };
};
