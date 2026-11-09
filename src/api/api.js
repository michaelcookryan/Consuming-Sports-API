/**
 * Makes an authenticated API request to get NFL team stats totals for the configured season.
 *
 * Returns a promise resolving to the API response data.
 */
import axios from "axios";

const season = process.env.REACT_APP_SEASON;

// Browser code calls this local API path only. In development, src/setupProxy.js
// forwards it to MySportsFeeds and adds Basic Auth server-side. In production,
// deploy the same route as a backend/serverless proxy and set REACT_APP_API_BASE_URL
// if the route is hosted outside the React app's origin.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api/mysportsfeeds";

export const getStats = async () => {
  const response = await axios
    .get(`${API_BASE_URL}/${season}/team_stats_totals.json?stats=W,L,T`)
    .catch((err) => {
      console.error(
        "getStats failed:",
        err.response?.status,
        err.response?.statusText ?? err.message,
      );
      throw err;
    });
  return response.data;
};

export const getSchedules = async () => {
  const response = await axios
    .get(`${API_BASE_URL}/${season}/games.json`)
    .catch((err) => {
      console.error(
        "getSchedules failed:",
        err.response?.status,
        err.response?.statusText ?? err.message,
      );
      throw err;
    });
  const { games } = response.data;
  return games;
};

export const getWeeklySchedules = async (week) => {
  const response = await axios
    .get(`${API_BASE_URL}/${season}/week/${week}/games.json`)
    .catch((err) => {
      console.error(
        "getWeeklySchedules failed:",
        err.response?.status,
        err.response?.statusText ?? err.message,
      );
      throw err;
    });
  const { games } = response.data;
  return games;
};
