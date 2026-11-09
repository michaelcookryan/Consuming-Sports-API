const { createProxyMiddleware } = require("http-proxy-middleware");
const { validateMySportsFeedsRequest } = require("../lib/mysportsfeeds-routes");
const MYSPORTSFEEDS_PROXY_PATH = "/api/mysportsfeeds";
const MYSPORTSFEEDS_TARGET = "https://api.mysportsfeeds.com";

module.exports = function setupProxy(app) {
  app.use(MYSPORTSFEEDS_PROXY_PATH, (req, res, next) => {
    // Express strips the mounted prefix from req.url.
    // Use originalUrl to validate the complete incoming request.
    const originalUrl = req.originalUrl || req.url;
    const rawPath = originalUrl.split(/[?#]/, 1)[0];

    if (!rawPath.startsWith(`${MYSPORTSFEEDS_PROXY_PATH}/`)) {
      res.status(404).send("Unsupported MySportsFeeds API request.");
      return;
    }

    const apiPath = rawPath.slice(MYSPORTSFEEDS_PROXY_PATH.length);
    const queryString = originalUrl.includes("?")
      ? originalUrl.slice(originalUrl.indexOf("?") + 1)
      : "";

    const upstreamPath = validateMySportsFeedsRequest(apiPath, queryString);

    if (!upstreamPath) {
      res.status(404).send("Unsupported MySportsFeeds API request.");
      return;
    }

    next();
  });
  app.use(
    MYSPORTSFEEDS_PROXY_PATH,
    createProxyMiddleware({
      target: MYSPORTSFEEDS_TARGET,
      changeOrigin: true,
      secure: true,
      pathRewrite: {
        [`^${MYSPORTSFEEDS_PROXY_PATH}`]: "/v2.1/pull/nfl",
      },
      onProxyReq(proxyReq) {
        const apiKey = process.env.MYSPORTSFEEDS_API_KEY;
        const password = process.env.MYSPORTSFEEDS_PASSWORD;

        // Keep MySportsFeeds credentials on the dev server instead of sending
        // them from browser JavaScript, which avoids CORS preflight failures and
        // prevents the Authorization header from being exposed in the UI bundle.
        if (!apiKey || !password) {
          console.warn(
            "MySportsFeeds proxy is missing MYSPORTSFEEDS_API_KEY or MYSPORTSFEEDS_PASSWORD.",
          );
          return;
        }

        const token = Buffer.from(`${apiKey}:${password}`, "utf8").toString(
          "base64",
        );
        proxyReq.setHeader("Authorization", `Basic ${token}`);
      },
    }),
  );
};
