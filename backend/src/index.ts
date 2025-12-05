import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import memoRoutes from "./routes/memoRoutes";

const app = new Hono();

// ▼▼▼ 1. ログ出力を強化（Originも表示） ▼▼▼
app.use("*", async (c, next) => {
  const origin = c.req.header("Origin");
  console.log(
    `>>> [GLOBAL LOG] Request: ${c.req.method} ${c.req.url} (Origin: ${origin})`
  );
  await next();
});

// ▼▼▼ 2. CORS設定を「柔軟」に修正 ▼▼▼
app.use(
  "/*",
  cors({
    origin: (origin) => {
      // ▼▼▼ 追加: フロントエンドの本番URLを許可 (末尾の / は不要) ▼▼▼
      if (origin === "https://simple-memo-frontend.onrender.com") return origin;

      // 既存の設定
      if (origin === "https://simple-memo-backend.onrender.com") return origin;
      if (origin && origin.startsWith("http://localhost:")) return origin;

      return origin;
    },
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.route("/api/memos", memoRoutes);

app.get("/", (c) => {
  return c.text("Simple Memo Backend is Running! (Ver. CORS-Fixed)");
});

const port = 8080;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
