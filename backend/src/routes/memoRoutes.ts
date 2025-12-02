import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware } from "@hono/clerk-auth";
import * as memoController from "../controllers/memoController";
import { createMemoSchema } from "../validators/memoValidator";

const app = new Hono();

app.use("*", clerkMiddleware());

app.get("/", memoController.getAllMemos);

// ↓↓↓ 修正: 'json' から 'form' に変更しました！ ↓↓↓
// これで画像付きのデータ(FormData)もチェックできるようになります
app.post("/", zValidator("form", createMemoSchema), memoController.createMemo);

app.put("/:id", memoController.updateMemo);
app.delete("/:id", memoController.deleteMemo);
app.post("/:id/summarize", memoController.summarizeMemo);

export default app;
