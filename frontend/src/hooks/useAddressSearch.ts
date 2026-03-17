import { useState, useEffect } from "react";

export const useAddressSearch = (delay = 600) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // Track if the current query came from a click selection
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    // 1. Don't search for very short queries or internal placeholders
    if (
      !query ||
      query.length < 3 ||
      query === "My Current Location" ||
      isSelected
    ) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=il&limit=5`,
          {
            headers: {
              "User-Agent": "SafeWay-Israel-App-Educational",
            },
          },
        );

        if (res.status === 429) {
          console.warn("Nominatim rate limit hit (429).");
          return;
        }

        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Geocoding fetch error:", err);
      } finally {
        setLoading(false);
      }
    }, delay);

    return () => clearTimeout(delayDebounceFn);
  }, [query, delay, isSelected]);

  // Wrapper for setQuery to reset the selection lock when typing
  const updateQuery = (val: string) => {
    setQuery(val);
    setIsSelected(false);
  };

  const selectAddress = (val: string) => {
    setIsSelected(true);
    setQuery(val);
    setResults([]);
  };

  return {
    query,
    setQuery: updateQuery,
    selectAddress,
    results,
    setResults,
    loading,
  };
};
