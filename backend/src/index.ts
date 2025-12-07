import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@hono/clerk-auth";
import routeApp from "./app";

const app = new Hono();

// --- ミドルウェア ---
app.use("*", async (c, next) => {
  const origin = c.req.header("Origin");
  console.log(`[LOG] ${c.req.method} ${c.req.url} (${origin})`);
  await next();
});

app.use(
  "/*",
  cors({
    origin: (origin) => {
      // 許可したいオリジン
      const allowedOrigins = [
        "http://localhost:5173",
        "https://simple-memo-frontend.onrender.com",
      ];
      if (allowedOrigins.includes(origin || "")) return origin;
      return origin;
    },
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("*", clerkMiddleware());

// --- ルートのマウント ---
app.route("/", routeApp);

app.get("/", (c) => c.text("Backend is Running"));

// 【修正箇所】環境変数 PORT を優先し、なければ 3000 (ローカル用) を使う
const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port, // 修正した port 変数を渡す
});
