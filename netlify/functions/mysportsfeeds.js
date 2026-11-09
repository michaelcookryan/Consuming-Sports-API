const https = require("https");
const {
  validateMySportsFeedsRequest,
} = require("../../lib/mysportsfeeds-routes");
const API_ROUTE_PREFIX = "/api/mysportsfeeds";
const FUNCTION_ROUTE_PREFIX = "/.netlify/functions/mysportsfeeds";
const MYSPORTSFEEDS_HOST = "api.mysportsfeeds.com";

function getMySportsFeedsCredentials() {
  return {
    apiKey: process.env.MYSPORTSFEEDS_API_KEY,
    password: process.env.MYSPORTSFEEDS_PASSWORD,
  };
}

function getApiPath(eventPath) {
  if (eventPath.startsWith(FUNCTION_ROUTE_PREFIX)) {
    return eventPath.slice(FUNCTION_ROUTE_PREFIX.length);
  }

  if (eventPath.startsWith(API_ROUTE_PREFIX)) {
    return eventPath.slice(API_ROUTE_PREFIX.length);
  }

  return eventPath;
}

function getQueryString(event) {
  if (event.rawQuery) {
    return event.rawQuery;
  }

  if (event.rawUrl) {
    return new URL(event.rawUrl).search.slice(1);
  }

  return new URLSearchParams(event.queryStringParameters || {}).toString();
}

function requestMySportsFeeds(path, authToken) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: MYSPORTSFEEDS_HOST,
        method: "GET",
        path,
        headers: {
          Accept: "application/json",
          Authorization: `Basic ${authToken}`,
        },
      },
      (response) => {
        const chunks = [];

        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode || 502,
            contentType:
              response.headers["content-type"] ||
              "application/json; charset=utf-8",
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    // Prevent stalled upstream requests from consuming function execution time.
    request.setTimeout(10000, () => {
      request.destroy(new Error("MySportsFeeds upstream request timed out."));
    });

    request.on("error", reject);
    request.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "Only GET requests are supported for this API proxy.",
    };
  }

  const { apiKey, password } = getMySportsFeedsCredentials();

  if (!apiKey || !password) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "MySportsFeeds proxy is missing MYSPORTSFEEDS_API_KEY or MYSPORTSFEEDS_PASSWORD.",
    };
  }

  const apiPath = getApiPath(event.path);
  const queryString = getQueryString(event);

  const upstreamPath = validateMySportsFeedsRequest(apiPath, queryString);

  if (!upstreamPath) {
    return {
      statusCode: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: "Unsupported MySportsFeeds API request.",
    };
  }
  const authToken = Buffer.from(`${apiKey}:${password}`, "utf8").toString(
    "base64",
  );

  try {
    const response = await requestMySportsFeeds(upstreamPath, authToken);

    return {
      statusCode: response.statusCode,
      headers: {
        "Content-Type": response.contentType,
        "Cache-Control": "no-store",
      },
      body: response.body,
    };
  } catch (error) {
    console.error("MySportsFeeds Netlify proxy failed:", error.message);

    return {
      statusCode: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: "MySportsFeeds proxy request failed.",
    };
  }
};
