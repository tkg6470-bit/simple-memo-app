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
// CORS設定（フロントエンドからのアクセスを許可）
app.use("/*", (0, cors_1.cors)());
// ルーティングの登録
// http://localhost:8080/api/memos/... でアクセスできるようにする
app.route("/api/memos", memoRoutes_1.default);
// ヘルスチェック用（ルートにアクセスしたときの確認用）
app.get("/", (c) => c.text("Memo App Backend is Running!"));
const port = 8080;
console.log(`Server is running on port ${port}`);
(0, node_server_1.serve)({
    fetch: app.fetch,
    port: Number(process.env.PORT) || 8080, // ← Renderのポートを使う
});
