const { createProxyMiddleware } = require("http-proxy-middleware");
require("request-to-curl");

module.exports = function (app) {
  // app.use(
  //   "/persisted",
  //   createProxyMiddleware({
  //     target: "https://esports-api.lolesports.com",
  //     changeOrigin: true,
  //     headers: {
  //       "x-api-key": "0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z",
  //     },
  //     logLevel: "debug",
  //   })
  // );
  // app.use(
  //   "/livestats",
  //   createProxyMiddleware({
  //     target: "https://feed.lolesports.com",
  //     changeOrigin: true,
  //     logLevel: "debug",
  //   })
  // );
};
