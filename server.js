const fs = require("fs");
const http = require("http");
const https = require("https");
const path = require("path");
const { validateMySportsFeedsRequest } = require("./lib/mysportsfeeds-routes");
const HOST = process.env.HOST || "0.0.0.0";
const PORT = process.env.PORT || 8080;
const BUILD_DIR = path.join(__dirname, "build");
const API_PROXY_PATH = "/api/mysportsfeeds";
const MYSPORTSFEEDS_HOST = "api.mysportsfeeds.com";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
};

function getMySportsFeedsCredentials() {
  return {
    apiKey: process.env.MYSPORTSFEEDS_API_KEY,
    password: process.env.MYSPORTSFEEDS_PASSWORD,
  };
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(message);
}

function applyCorsHeaders(request, response) {
  // Same-origin deployment does not need CORS. Set CORS_ALLOW_ORIGIN only when
  // the proxy is deployed on a different origin than the React app.
  const allowedOrigin = process.env.CORS_ALLOW_ORIGIN;

  if (!allowedOrigin) {
    return;
  }

  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Vary", "Origin");
  response.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function proxyMySportsFeedsRequest(request, response) {
  applyCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== "GET") {
    sendText(
      response,
      405,
      "Only GET requests are supported for this API proxy.",
    );
    return;
  }

  const { apiKey, password } = getMySportsFeedsCredentials();

  if (!apiKey || !password) {
    sendText(
      response,
      500,
      "MySportsFeeds proxy is missing MYSPORTSFEEDS_API_KEY or MYSPORTSFEEDS_PASSWORD.",
    );
    return;
  }

  const incomingUrl = new URL(request.url, "http://localhost");

  // Reject ambiguous raw paths before URL normalization.
  const rawPath = request.url.split(/[?#]/, 1)[0];

  if (rawPath !== API_PROXY_PATH && !rawPath.startsWith(`${API_PROXY_PATH}/`)) {
    sendText(response, 404, "Unsupported MySportsFeeds API request.");
    return;
  }

  const apiPath = rawPath.slice(API_PROXY_PATH.length);

  const upstreamPath = validateMySportsFeedsRequest(
    apiPath,
    incomingUrl.search,
  );

  if (!upstreamPath) {
    sendText(response, 404, "Unsupported MySportsFeeds API request.");
    return;
  }

  const authToken = Buffer.from(`${apiKey}:${password}`, "utf8").toString(
    "base64",
  );

  const proxyRequest = https.request(
    {
      hostname: MYSPORTSFEEDS_HOST,
      method: "GET",
      path: upstreamPath,
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${authToken}`,
      },
    },
    (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode || 502, {
        "Content-Type":
          proxyResponse.headers["content-type"] ||
          "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      proxyResponse.pipe(response);
    },
  );

  proxyRequest.on("error", (error) => {
    console.error("MySportsFeeds proxy request failed:", error.message);
    sendText(response, 502, "MySportsFeeds proxy request failed.");
  });

  proxyRequest.end();
}

function serveStaticAsset(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath =
    requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const hasFileExtension = path.extname(requestedPath) !== "";
  const relativePath = hasFileExtension ? requestedPath : "/index.html";
  const filePath = path.normalize(path.join(BUILD_DIR, relativePath));

  if (!filePath.startsWith(BUILD_DIR)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendText(response, 404, "Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type":
        CONTENT_TYPES[path.extname(filePath)] || "application/octet-stream",
    });
    response.end(content);
  });
}

function createRequestHandler() {
  return (request, response) => {
    if (
      request.url.startsWith(`${API_PROXY_PATH}/`) ||
      request.url === API_PROXY_PATH ||
      request.url.startsWith(`${API_PROXY_PATH}?`)
    ) {
      proxyMySportsFeedsRequest(request, response);
      return;
    }

    serveStaticAsset(request, response);
  };
}

function startServer() {
  const server = http.createServer(createRequestHandler());

  server.on("error", (error) => {
    console.error(
      `Pool app failed to listen on ${HOST}:${PORT}:`,
      error.message,
    );
    process.exit(1);
  });

  server.listen(PORT, HOST, () => {
    console.log(`Pool app listening on ${HOST}:${PORT}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = {
  createRequestHandler,
  startServer,
};
