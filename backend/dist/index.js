"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
// 👇 default export を受け取る書き方に統一
const memoRoutes_1 = __importDefault(require("./routes/memoRoutes"));
const app = new hono_1.Hono();
// ▼▼▼ 1. 全リクエストログ (検問) ▼▼▼
app.use("*", async (c, next) => {
    console.log(`>>> [GLOBAL LOG] Incoming Request: ${c.req.method} ${c.req.url}`);
    await next();
});
// ▼▼▼ 2. CORS設定 ▼▼▼
app.use("/*", (0, cors_1.cors)({
    origin: ["http://localhost:5173", "https://simple-memo.onrender.com"],
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
}));
// ルート適用
app.route("/api/memos", memoRoutes_1.default);
// ▼▼▼ 3. バージョン確認用エンドポイント ▼▼▼
app.get("/", (c) => {
    return c.text("Simple Memo Backend is Running! (Ver. Fixed-Routes)");
});
const port = 8080;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port,
});
