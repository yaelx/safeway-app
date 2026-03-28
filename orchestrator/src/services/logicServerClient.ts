import axios from "axios";
import { INTERNAL_SERVICES } from "../config/constants";

const { BASE_URL, ENDPOINTS, HEADER_KEY } = INTERNAL_SERVICES.PYTHON_SOLVER;

export const logicServerClient = {
  // evaluateRoute: async (routePoints: any[], shelterData: any[]) => {
  //   const url = `${BASE_URL}${ENDPOINTS.EVALUATE}`;
  //   try {
  //     // Basic validation before the call
  //     if (!url || url.includes("undefined")) {
  //       throw new Error(
  //         `Constructed an invalid URL: ${url}. Check your constants and .env file.`,
  //       );
  //     }

  //     const response = await axios.post(
  //       url,
  //       { routePoints, shelterData },
  //       {
  //         headers: { [HEADER_KEY]: process.env.INTERNAL_SECRET_TOKEN },
  //         timeout: 10000, // Added a 10s timeout for safety math
  //       },
  //     );
  //     return response.data;
  //   } catch (error: any) {
  //     // Catching the error here lets you provide a better message to the Orchestrator
  //     if (error.response) {
  //       // The server responded with a status code outside the 2xx range
  //       console.error(
  //         "Python Server Error:",
  //         error.response.status,
  //         error.response.data,
  //       );
  //     } else if (error.request) {
  //       // The request was made but no response was received
  //       console.error(
  //         "No response from Python Server. Is it running at http://localhost:8000?",
  //       );
  //     } else {
  //       // Something happened in setting up the request that triggered an Error
  //       console.error("Request Setup Error:", error.message);
  //     }

  //     // Re-throw so the RoutingService knows the safety check failed
  //     throw new Error(`Logic Server communication failed: ${error.message}`);
  //   }
  // },

  evaluateAlternatives: async (routes: number[][][], shelterData: any[]) => {
    const url = `${BASE_URL}${ENDPOINTS.EVALUATE}`; // Ensure this points to /evaluate_alternatives

    try {
      const response = await axios.post(
        url,
        { routes, shelterData }, // Sending 'routes' as an array of arrays
        {
          headers: { [HEADER_KEY]: process.env.INTERNAL_SECRET_TOKEN },
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
