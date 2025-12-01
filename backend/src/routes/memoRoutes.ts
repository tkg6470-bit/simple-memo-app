import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { clerkMiddleware } from "@hono/clerk-auth";
import * as memoController from "../controllers/memoController";
import { createMemoSchema } from "../validators/memoValidator";

const app = new Hono();

app.use("*", clerkMiddleware());

app.get("/", memoController.getAllMemos);
app.post("/", zValidator("json", createMemoSchema), memoController.createMemo);
app.put("/:id", memoController.updateMemo);
app.delete("/:id", memoController.deleteMemo);

// ↓↓↓ 今回追加する行 ↓↓↓
app.post("/:id/summarize", memoController.summarizeMemo);

export default app;
