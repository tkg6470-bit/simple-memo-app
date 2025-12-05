"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const memoController_1 = require("../controllers/memoController");
const app = new hono_1.Hono();
// ルート定義
app.get("/", memoController_1.getAllMemos);
app.post("/", memoController_1.createMemo);
app.get("/search", memoController_1.searchMemos);
app.put("/:id", memoController_1.updateMemo);
app.delete("/:id", memoController_1.deleteMemo);
app.post("/:id/summarize", memoController_1.summarizeMemo);
// 👇 ここを「default export」に統一します
exports.default = app;
