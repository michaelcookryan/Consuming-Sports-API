const API_ROOT = "/v2.1/pull/nfl";
const SEASON_PATTERN = /^(\d{4})-(\d{4})-regular$/;
const WEEK_PATTERN = /^(?:[1-9]|1[0-8])$/;

function isValidSeason(season) {
  const match = SEASON_PATTERN.exec(season);

  return match !== null && Number(match[2]) === Number(match[1]) + 1;
}
/**
 * Validates a MySportsFeeds request against the endpoints
 * used by Team Pool.
 *
 * Returns a canonical upstream path for valid requests,
 * or null for unsupported requests.
 */
function validateMySportsFeedsRequest(pathname, search = "") {
  if (typeof pathname !== "string" || typeof search !== "string") {
    return null;
  }

  // Reject ambiguous or encoded paths.
  if (
    !pathname.startsWith("/") ||
    pathname.includes("%") ||
    pathname.includes("\\") ||
    pathname.includes("//") ||
    pathname.includes("?") ||
    pathname.includes("#")
  ) {
    return null;
  }

  // Reject malformed query encoding before URLSearchParams
  // can normalize or replace invalid characters.
  if (
    /%(?![0-9a-fA-F]{2})/.test(search) ||
    /%(?:[0-9a-fA-F]{2})/g.test(search.replace(/%[0-9a-fA-F]{2}/g, "")) ||
    search.includes("#")
  ) {
    return null;
  }

  const segments = pathname.slice(1).split("/");
  const season = segments[0];

  if (!isValidSeason(season || "")) {
    return null;
  }

  const params = new URLSearchParams(search);
  const queryEntries = [...params.entries()];

  // Team standings
  if (segments.length === 2 && segments[1] === "team_stats_totals.json") {
    if (
      queryEntries.length !== 1 ||
      queryEntries[0][0] !== "stats" ||
      queryEntries[0][1] !== "W,L,T"
    ) {
      return null;
    }

    return `${API_ROOT}/${season}/team_stats_totals.json?stats=W,L,T`;
  }

  // Full-season schedule
  if (
    segments.length === 2 &&
    segments[1] === "games.json" &&
    queryEntries.length === 0
  ) {
    return `${API_ROOT}/${season}/games.json`;
  }

  // Weekly schedule — regular season only
  if (
    segments.length === 4 &&
    segments[1] === "week" &&
    WEEK_PATTERN.test(segments[2]) &&
    segments[3] === "games.json" &&
    queryEntries.length === 0
  ) {
    return `${API_ROOT}/${season}/week/${segments[2]}/games.json`;
  }

  return null;
}

module.exports = { validateMySportsFeedsRequest };
