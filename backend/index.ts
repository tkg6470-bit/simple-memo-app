import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import memoRoutes from "./src/routes/memoRoutes";

const app = new Hono();
const PORT = 8080;

// CORSの設定
app.use("/*", cors());

// ルートの設定
app.route("/memos", memoRoutes);

// 動作確認用
app.get("/", (c) => {
  return c.text("Memo App Backend with Hono is running!");
});

console.log(`Server is running on port ${PORT}`);

// Node.jsでHonoを動かすための設定
serve({
  fetch: app.fetch,
  port: PORT,
});
