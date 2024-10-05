import { serveFile } from "jsr:@std/http@1.0/file-server";

Deno.serve((req) => {
  const url = req.url;
  const path = new URL(url).pathname;
  if (path === "/") {
    return serveFile(req, "web/index.html");
  }
  return serveFile(req, "web/" + path);
});
