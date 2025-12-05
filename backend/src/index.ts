import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@hono/clerk-auth"; // 👈 追加
import memoRoutes from "./routes/memoRoutes";

const app = new Hono();

// 1. グローバルログ
app.use("*", async (c, next) => {
  const origin = c.req.header("Origin");
  console.log(
    `>>> [GLOBAL LOG] Request: ${c.req.method} ${c.req.url} (Origin: ${origin})`
  );
  await next();
});

// 2. CORS設定
app.use(
  "/*",
  cors({
    origin: (origin) => {
      if (origin === "https://simple-memo-frontend.onrender.com") return origin;
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

// 3. Clerk認証ミドルウェア (これが無いと userId が取れません！)
app.use("*", clerkMiddleware());

// 4. ルート適用
app.route("/api/memos", memoRoutes);

// ヘルスチェック
app.get("/", (c) => {
  return c.text("Simple Memo Backend is Running! (Ver. Auth-Enabled)");
});

const port = 8080;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
