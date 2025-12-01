import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware } from "@hono/clerk-auth"; // 追加
import * as memoController from "../controllers/memoController";
import { createMemoSchema } from "../validators/memoValidator";

const app = new Hono();

// このルーター配下のすべてのリクエストに Clerk 認証を適用
app.use("*", clerkMiddleware());

app.get("/", memoController.getAllMemos);
app.post("/", zValidator("json", createMemoSchema), memoController.createMemo);
app.put("/:id", memoController.updateMemo);
app.delete("/:id", memoController.deleteMemo);

export default app;
