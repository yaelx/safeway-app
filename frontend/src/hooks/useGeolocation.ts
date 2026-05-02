const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

// Pure function — just wraps the browser API with abort support
export async function getCurrentPosition(
  signal: AbortSignal,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    // Abort support — if signal fires, reject immediately
    signal.addEventListener("abort", () =>
      reject(new DOMException("Aborted", "AbortError")),
    );

    navigator.geolocation.getCurrentPosition(resolve, reject, GEO_OPTIONS);
  });
}

// Retries with exponential backoff, respects abort signal
export async function locateWithRetry(
  signal: AbortSignal,
  retries = 3,
  delay = 1000,
): Promise<GeolocationPosition> {
  for (let attempt = 0; attempt < retries; attempt++) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    try {
      return await getCurrentPosition(signal);
    } catch (err) {
      const isLast = attempt === retries - 1;
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      if (isAbort || isLast) throw err;
      await new Promise((res) => setTimeout(res, delay * 2 ** attempt));
    }
  }
  throw new Error("Unreachable");
}
