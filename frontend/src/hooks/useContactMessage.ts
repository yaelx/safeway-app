import { useState, useCallback } from "react";
import { ContactFormData } from "../types/types";

export const useContactMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendContactMessage = async (data: ContactFormData) => {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Handle non-200 responses
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage =
        errorData.error === "Failed to fetch"
          ? "Our server is currently offline. Please try again in a few minutes."
          : errorData.error;
      throw new Error(errorMessage);
    }

    return response.json();
  };

  const sendMessage = useCallback(async (data: ContactFormData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await sendContactMessage(data);
      setSuccess(true);
      return true; // Useful for the component to know when to reset the form
    } catch (err: any) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset helper to clear success/error states (e.g., when the user starts typing again)
  const resetStatus = useCallback(() => {
    setSuccess(false);
    setError(null);
  }, []);

  return { sendMessage, loading, error, success, resetStatus };
};
