import { useState, useEffect, useCallback } from "react";

export const useRecentSearches = (
  key: string = "recent_destination_searches",
  limit: number = 5,
) => {
  const [recentSearches, setRecentSearches] = useState<any[]>([]);

  // 1. Load from localStorage on initialization
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load recents:", e);
    }
  }, [key]);

  // 2. Function to add a new search
  const saveRecent = useCallback(
    (location: any) => {
      if (!location || !location.address) return;

      setRecentSearches((prev) => {
        const filtered = prev.filter(
          (item) => item.address !== location.address,
        );
        const updated = [location, ...filtered].slice(0, limit);

        // PERSIST: This is where the key is created
        localStorage.setItem(key, JSON.stringify(updated));
        return updated;
      });
    },
    [key, limit],
  );

  const clearRecents = () => {
    setRecentSearches([]);
    localStorage.removeItem(key);
  };

  return { recentSearches, saveRecent, clearRecents };
};
