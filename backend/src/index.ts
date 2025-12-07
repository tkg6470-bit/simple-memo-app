import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { clerkMiddleware } from "@hono/clerk-auth";
import routeApp from "./app"; // 👈 作成した app.ts を読み込み

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
// ここで、先ほど作った routeApp をメインアプリに合体させます
app.route("/", routeApp);

app.get("/", (c) => c.text("Backend is Running"));

const port = 8080;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
