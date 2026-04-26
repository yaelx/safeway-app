import { useState, useEffect, useMemo, useRef } from "react";
import { API_ENDPOINTS } from "../config/constants";
import { decodeHttpResponse } from "../utils/security";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const DEBOUNCE_MS = 800;
const PRECISION = 2; // ~1km grid snapping
const MAX_CACHE_ENTRIES = 100;
const FETCH_TIMEOUT_MS = 12000;

// Simple in-memory cache — lives for the browser session
const shelterCache = new Map<string, { shelters: any[]; timestamp: number }>();
const CLIENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function isRetryable(error: unknown): boolean {
  // distinguishes network failures (retry) from decryption failures (don't retry, something is fundamentally wrong), only network errors
  if (error instanceof Error) {
    if (error.message.includes("Decryption failed")) return false;
    if (error.message.includes("Missing X-Key-Time")) return false;
  }
  return true;
}

async function fetchWithRetry(bounds: any, signal: AbortSignal): Promise<any> {
  const timeoutSignal = AbortSignal.timeout(FETCH_TIMEOUT_MS);
  const combinedSignal = AbortSignal.any([signal, timeoutSignal]);

  const round = (n: number) => Math.round(n * 10000) / 10000; // 4dp, matches backend
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const cacheKey = `${round(sw.lat)},${round(sw.lng)},${round(ne.lat)},${round(ne.lng)}`;

  // Check client cache first — no network request at all
  const cached = shelterCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL) {
    return { shelters: cached.shelters };
  }

  const payload = {
    minLat: sw.lat,
    maxLat: ne.lat,
    minLng: sw.lng,
    maxLng: ne.lng,
  };

  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      const res = await fetch(API_ENDPOINTS.SHELTERS_IN_BOUNDS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: combinedSignal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await decodeHttpResponse(res);

      shelterCache.set(cacheKey, {
        shelters: Array.isArray(data) ? data : (data.shelters ?? []),
        timestamp: Date.now(),
      });

      if (shelterCache.size > MAX_CACHE_ENTRIES) {
        // Delete the oldest entry (Maps preserve insertion order)
        const oldestKey = shelterCache.keys().next().value!;
        shelterCache.delete(oldestKey);
      }

      return data;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") throw e;
      if (!isRetryable(e)) throw e;
      lastError = e;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * 2 ** attempt));
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
    if (!bounds) return null;
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    // Round to 2 decimal places — tiny pans produce the same key → no refetch
    const round = (n: number) =>
      Math.round(n * 10 ** PRECISION) / 10 ** PRECISION;
    return `${round(sw.lat)},${round(sw.lng)},${round(ne.lat)},${round(ne.lng)}`;
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
        const shelters = Array.isArray(data) ? data : (data.shelters ?? []);
        setShelters(shelters);
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
