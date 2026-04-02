import axios from "axios";
import { INTERNAL_SERVICES } from "../config/constants";
import { RouteShelter } from "../types/types";

const { BASE_URL, ENDPOINTS, HEADER_KEY } = INTERNAL_SERVICES.PYTHON_SOLVER;

export const logicServerClient = {
  evaluateAlternatives: async (
    routes: number[][][],
    shelterData: RouteShelter[],
    authHeader: string,
  ) => {
    const url = `${BASE_URL}${ENDPOINTS.EVALUATE}`; // Ensure this points to /evaluate_alternatives

    try {
      const response = await axios.post(
        url,
        { routes, shelterData }, // Sending 'routes' as an array of arrays
        {
          headers: { Authorization: authHeader },
          timeout: 15000, // Increased timeout for multiple route processing
        },
      );
      return response.data;
    } catch (error: any) {
      // Catching the error here lets you provide a better message to the Orchestrator
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error(
          "Python Server Error:",
          error.response.status,
          error.response.data,
        );
      } else if (error.request) {
        // The request was made but no response was received
        console.error(
          "No response from Python Server. Is it running at http://localhost:8000?",
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Request Setup Error:", error.message);
      }

      // Re-throw so the RoutingService knows the safety check failed
      throw new Error(`Logic Server communication failed: ${error.message}`);
    }
  },

  checkHealth: async () => {
    return axios.get(`${BASE_URL}${ENDPOINTS.HEALTH}`);
  },
};
