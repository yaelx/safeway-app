import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "../config/constants";

export const useGovMapLoader = (token: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if script already exists
    if (window.govmap) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `${API_ENDPOINTS.GOV_MAP}${token}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // The SDK often needs a tiny bit of time to initialize
      // the govmap object after the script file is loaded.
      const checkInterval = setInterval(() => {
        if (window.govmap) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
    };

    script.onerror = () => setError("Failed to load GovMap SDK");

    document.head.appendChild(script);

    return () => {
      // Optional: cleanup if necessary, though usually
      // mapping SDKs stay for the session duration.
    };
  }, [token]);

  return { isLoaded, error };
};
