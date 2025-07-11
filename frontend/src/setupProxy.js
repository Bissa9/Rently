// src/setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // Proxy any request starting with /api to your Express backend on port 5001
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:5000",
      changeOrigin: true,
    })
  );

  // Proxy any request starting with /webhooks to Rasa on port 5005
  app.use(
    "/webhooks",
    createProxyMiddleware({
      target: "http://localhost:5005",
      changeOrigin: true,
    })
  );
};
