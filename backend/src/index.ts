import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@hono/clerk-auth";
import routeApp from "./app";
// --- 👇 Sentry 関連のインポートを追加 ---
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// --- 👇 Sentry 初期化処理を追加 ---
// DSNは .env から自動的に読み込まれます
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [nodeProfilingIntegration()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // 本番環境では 0.1 (10%) 程度に下げることを推奨
  profilesSampleRate: 1.0,
});
// ------------------------------------

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

// --- 👇 エラーハンドリングを追加 (Sentry送信) ---
app.onError((err, c) => {
  console.error("[App Error]", err);
  // Sentry に例外を送信
  Sentry.captureException(err);
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});
// ----------------------------------------------

// 環境変数 PORT を優先し、なければ 3000 (ローカル用) を使う
const port = Number(process.env.PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
});
