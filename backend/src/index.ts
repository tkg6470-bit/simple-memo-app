import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
// 👇 default export を受け取る書き方に統一
import memoRoutes from "./routes/memoRoutes";

const app = new Hono();

// ▼▼▼ 1. 全リクエストログ (検問) ▼▼▼
app.use("*", async (c, next) => {
  console.log(
    `>>> [GLOBAL LOG] Incoming Request: ${c.req.method} ${c.req.url}`
  );
  await next();
});

// ▼▼▼ 2. CORS設定 ▼▼▼
app.use(
  "/*",
  cors({
    origin: ["http://localhost:5173", "https://simple-memo.onrender.com"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// ルート適用
app.route("/api/memos", memoRoutes);

// ▼▼▼ 3. バージョン確認用エンドポイント ▼▼▼
app.get("/", (c) => {
  return c.text("Simple Memo Backend is Running! (Ver. Fixed-Routes)");
});

const port = 8080;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
