import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator"; // 追加
import * as memoController from "../controllers/memoController";
import { createMemoSchema } from "../validators/memoValidator"; // 追加

const app = new Hono();

app.get("/", memoController.getAllMemos);

// ↓↓↓ ここに zValidator を追加（門番を設置） ↓↓↓
app.post(
  "/",
  zValidator("json", createMemoSchema), // JSONデータをスキーマでチェック！ダメなら400エラーを自動で返す
  memoController.createMemo
);

app.put("/:id", memoController.updateMemo);
app.delete("/:id", memoController.deleteMemo);

export default app;
