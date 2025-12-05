import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
// 👇 修正箇所: { memoRoutes } ではなく memoRoutes に変更
import memoRoutes from "./routes/memoRoutes";

const app = new Hono();

// ▼▼▼ 1. すべての通信をログに出す「検問」を追加 (最重要) ▼▼▼
app.use("*", async (c, next) => {
  console.log(
    `>>> [GLOBAL LOG] Incoming Request: ${c.req.method} ${c.req.url}`
  );
  await next();
});

// CORS設定
app.use(
  "/*",
  cors({
    origin: [
      "http://localhost:5173",
      "https://simple-memo.onrender.com",
      // 必要に応じて本番フロントエンドのURLを追加
    ],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

// ルート設定
app.route("/api/memos", memoRoutes);

// ▼▼▼ 2. 生存確認用のメッセージを変更 (デプロイ確認用) ▼▼▼
app.get("/", (c) => {
  console.log(">>> [GLOBAL LOG] Health Check Hit!");
  return c.text("Simple Memo Backend is Running! (Ver. Debug)");
});

const port = 8080;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
