const express = require("express");
const next = require("next");
const { createProxyMiddleware } = require("http-proxy-middleware");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  server.use(
    "/inventory/v1/viewer/G-Neos/Inventory/neos/assets/",
    createProxyMiddleware({
      target: "https://assets.neos.com/assets",
      changeOrigin: true,
        logLevel: 'debug',
      pathRewrite: function(path, req) {
        let newPath = path.replace("/inventory/v1/viewer/G-Neos/Inventory/neos/assets/","");
        console.log(newPath)
        return newPath;
      },
    })
  );

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
