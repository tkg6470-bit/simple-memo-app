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
        // 本番環境 (Render) は許可
        if (origin === "https://simple-memo.onrender.com")
            return origin;
        // ローカル開発 (localhost) は、ポート番号問わずすべて許可
        if (origin && origin.startsWith("http://localhost:"))
            return origin;
        // それ以外は許可しない（またはデバッグ用に許可）
        return origin; // 一時的に全許可して動作確認したい場合はここを return origin にする
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
