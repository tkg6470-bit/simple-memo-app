import { Hono } from "hono";
import {
  createMemo,
  getAllMemos,
  searchMemos,
  updateMemo,
  deleteMemo,
  summarizeMemo,
} from "../controllers/memoController";

const app = new Hono();

// ルート定義
app.get("/", getAllMemos);
app.post("/", createMemo);
app.get("/search", searchMemos);
app.put("/:id", updateMemo);
app.delete("/:id", deleteMemo);
app.post("/:id/summarize", summarizeMemo);

// 👇 ここを「default export」に統一します
export default app;
