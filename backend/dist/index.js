"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const clerk_auth_1 = require("@hono/clerk-auth"); // 👈 追加
const memoRoutes_1 = __importDefault(require("./routes/memoRoutes"));
const app = new hono_1.Hono();
// 1. グローバルログ
app.use("*", async (c, next) => {
    const origin = c.req.header("Origin");
    console.log(`>>> [GLOBAL LOG] Request: ${c.req.method} ${c.req.url} (Origin: ${origin})`);
    await next();
});
// 2. CORS設定
app.use("/*", (0, cors_1.cors)({
    origin: (origin) => {
        if (origin === "https://simple-memo-frontend.onrender.com")
            return origin;
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
// 3. Clerk認証ミドルウェア (これが無いと userId が取れません！)
app.use("*", (0, clerk_auth_1.clerkMiddleware)());
// 4. ルート適用
app.route("/api/memos", memoRoutes_1.default);
// ヘルスチェック
app.get("/", (c) => {
    return c.text("Simple Memo Backend is Running! (Ver. Auth-Enabled)");
});
const port = 8080;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port,
});
