import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware } from "@hono/clerk-auth";
// memoControllerから必要な全ての関数をインポート
import * as memoController from "../controllers/memoController";
import { createMemoSchema } from "../validators/memoValidator";

// PrismaClientの初期化はmemoController.tsで行うため、ここでは削除します
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient(); // <--- 削除

const app = new Hono();

// Clerk認証ミドルウェアを適用
app.use("*", clerkMiddleware());

// 6. ベクトル検索 (GET /api/memos/search?q=...) - F-08 <-- ここを追加！
app.get("/search", memoController.searchMemos);

// 1. 全件取得 (GET /api/memos)
app.get("/", memoController.getAllMemos);

// 2. 作成 (POST /api/memos)
// ZodバリデーターでFormDataを検証
app.post("/", zValidator("form", createMemoSchema), memoController.createMemo);

// 3. 更新 (PUT /api/memos/:id)
app.put("/:id", memoController.updateMemo);

// 4. 削除 (DELETE /api/memos/:id)
app.delete("/:id", memoController.deleteMemo);

// 5. AI要約 (POST /api/memos/:id/summarize) - F-07
app.post("/:id/summarize", memoController.summarizeMemo);

export default app;
