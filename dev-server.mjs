import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(".");
const port = Number(process.env.PORT || 5173);
const host = "127.0.0.1";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
};

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filepath = normalize(join(root, requested));

  if (!filepath.startsWith(root) || !existsSync(filepath) || !statSync(filepath).isFile()) {
    response.writeHead(404, { "Content-Type": types[".html"] });
    createReadStream(join(root, "404.html")).pipe(response);
    return;
  }

  response.writeHead(200, {
    "Content-Type": types[extname(filepath)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(filepath).pipe(response);
}).listen(port, host, () => {
  console.log(`Portfolio preview running at http://${host}:${port}/`);
});
