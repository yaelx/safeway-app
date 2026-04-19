import axios from "axios";
import { INTERNAL_SERVICES } from "../config/constants";
import { logger } from "../middleware/logger";
import { RouteShelter } from "../types/types";
import { OSMLeg } from "../types/osmType";
const { BASE_URL, ENDPOINTS, HEADER_KEY } = INTERNAL_SERVICES.PYTHON_SOLVER;

export const logicServerClient = {
  /**
   * Refactored to handle complex route objects (legs/steps)
   * instead of just raw coordinate arrays.
   */

  evaluateAlternatives: async (
    payloads: { legs: OSMLeg[]; shelterData: RouteShelter[] }[],
    authHeader: string,
  ) => {
    const url = `${BASE_URL}${ENDPOINTS.EVALUATE}`; // Ensure this points to /evaluate_alternatives

    try {
      const response = await axios.post(url, payloads, {
        headers: { Authorization: authHeader },
        timeout: 15000, // Increased timeout for multiple route processing
      });
      return response.data;
    } catch (error: any) {
      // Catching the error here lets you provide a better message to the Orchestrator
      if (error.response) {
        logger.error(
          { event: 'LOGIC_SERVER_HTTP_ERROR', status: error.response.status, responseData: error.response.data, url, err: error },
          'Python Logic Server responded with an error status',
        );
      } else if (error.request) {
        logger.error(
          { event: 'LOGIC_SERVER_NO_RESPONSE', url, err: error },
          'No response received from Python Logic Server',
        );
      } else {
        logger.error(
          { event: 'LOGIC_SERVER_REQUEST_SETUP_ERROR', err: error },
          'Failed to construct request to Python Logic Server',
        );
      }

      // Re-throw so the RoutingService knows the safety check failed
      throw new Error(`Logic Server communication failed: ${error.message}`);
    }
  },

  checkHealth: async () => {
    return axios.get(`${BASE_URL}${ENDPOINTS.HEALTH}`);
  },
};
