"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const memoRoutes_1 = __importDefault(require("./routes/memoRoutes"));
const app = new hono_1.Hono();
// ▼▼▼ 1. ログ出力を強化（Originも表示） ▼▼▼
app.use("*", async (c, next) => {
    const origin = c.req.header("Origin");
    console.log(`>>> [GLOBAL LOG] Request: ${c.req.method} ${c.req.url} (Origin: ${origin})`);
    await next();
});
// ▼▼▼ 2. CORS設定を「柔軟」に修正 ▼▼▼
app.use("/*", (0, cors_1.cors)({
    origin: (origin) => {
        // ▼▼▼ 追加: フロントエンドの本番URLを許可 (末尾の / は不要) ▼▼▼
        if (origin === "https://simple-memo-frontend.onrender.com")
            return origin;
        // 既存の設定
        if (origin === "https://simple-memo-backend.onrender.com")
            return origin;
        if (origin && origin.startsWith("http://localhost:"))
            return origin;
        return origin;
    },
    allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
}));
app.route("/api/memos", memoRoutes_1.default);
app.get("/", (c) => {
    return c.text("Simple Memo Backend is Running! (Ver. CORS-Fixed)");
});
const port = 8080;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port,
});
