import { Hono } from "hono";
import { memoRouter } from "./routes/memoRoutes";

// テスト用の簡単なルーター
const testRouter = new Hono().get("/hello", (c) =>
  c.json({ message: "Hello from Test!" })
);

// アプリケーションのルート定義
const app = new Hono()
  // ここでパス構造を作ります
  .route("/api/memos", memoRouter)
  .route("/api/test", testRouter);

export default app;

// ▼▼▼ フロントエンドで型を使うために必須の記述 ▼▼▼
export type AppType = typeof app;

// Fix: Force update for Render deployment
