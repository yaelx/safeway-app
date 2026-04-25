import { useState, useEffect, useMemo, useRef } from "react";
import { API_ENDPOINTS } from "../config/constants";
import { decodeHttpResponse } from "../utils/security";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const DEBOUNCE_MS = 800;

function isRetryable(error: unknown): boolean {
  // distinguishes network failures (retry) from decryption failures (don't retry, something is fundamentally wrong), only network errors
  if (error instanceof Error) {
    if (error.message.includes("Decryption failed")) return false;
    if (error.message.includes("Missing X-Key-Time")) return false;
  }
  return true;
}

async function fetchWithRetry(bounds: any, signal: AbortSignal): Promise<any> {
  const payload = {
    minLat: bounds.getSouthWest().lat,
    maxLat: bounds.getNorthEast().lat,
    minLng: bounds.getSouthWest().lng,
    maxLng: bounds.getNorthEast().lng,
  };

  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");

    try {
      const res = await fetch(API_ENDPOINTS.SHELTERS_IN_BOUNDS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      return await decodeHttpResponse(res);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e; // don't retry aborts
      if (!isRetryable(e)) throw e; // don't retry decryption failures

      lastError = e;
      console.warn(
        `Shelter fetch attempt ${attempt + 1}/${MAX_RETRIES} failed:`,
        e,
      );

      if (attempt < MAX_RETRIES - 1) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAY_MS * 2 ** attempt),
        );
      }
    }
  }

  throw lastError;
}

export const useShelters = (bounds: any, enabled: boolean) => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const boundsKey = useMemo(() => {
    return bounds
      ? `${bounds.getSouthWest().lat}-${bounds.getSouthWest().lng}-${bounds.getNorthEast().lat}-${bounds.getNorthEast().lng}`
      : null;
  }, [bounds]);

  useEffect(() => {
    if (!enabled || !boundsKey || !bounds) return;

    // Cancel any in-flight request immediately
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Clear previous error so new bounds get a fresh attempt
    setError(null);

    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchWithRetry(bounds, controller.signal);
        setShelters(data.shelters ?? []);
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return; // user panned away — silent
        console.error("Shelter fetch permanently failed:", e);
        setError("Failed to load shelters. Please try again.");
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [boundsKey, enabled]);

  return { shelters, loading, error };
};
