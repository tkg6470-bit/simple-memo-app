import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import memoRoutes from "./routes/memoRoutes";

const app = new Hono();

// CORS設定（フロントエンドからのアクセスを許可）
app.use("/*", cors());

// ルーティングの登録
// http://localhost:8080/api/memos/... でアクセスできるようにする
app.route("/api/memos", memoRoutes);

// ヘルスチェック用（ルートにアクセスしたときの確認用）
app.get("/", (c) => c.text("Memo App Backend is Running!"));

const port = 8080;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
