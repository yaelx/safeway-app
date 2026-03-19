import axios from "axios";
import { INTERNAL_SERVICES } from "../config/constants";

const { BASE_URL, ENDPOINTS, HEADER_KEY } = INTERNAL_SERVICES.PYTHON_SOLVER;

export const logicServerClient = {
  evaluateRoute: async (routePoints: any[], shelterData: any[]) => {
    const url = `${BASE_URL}${ENDPOINTS.EVALUATE}`;
    const response = await axios.post(
      url,
      { routePoints, shelterData },
      {
        headers: { [HEADER_KEY]: process.env.INTERNAL_SECRET_TOKEN },
      },
    );
    return response.data;
  },

  checkHealth: async () => {
    return axios.get(`${BASE_URL}${ENDPOINTS.HEALTH}`);
  },
};
