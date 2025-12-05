"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const hono_1 = require("hono");
const zod_validator_1 = require("@hono/zod-validator");
const clerk_auth_1 = require("@hono/clerk-auth");
// memoControllerから必要な全ての関数をインポート
const memoController = __importStar(require("../controllers/memoController"));
const memoValidator_1 = require("../validators/memoValidator");
// PrismaClientの初期化はmemoController.tsで行うため、ここでは削除します
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient(); // <--- 削除
const app = new hono_1.Hono();
// Clerk認証ミドルウェアを適用
app.use("*", (0, clerk_auth_1.clerkMiddleware)());
// 6. ベクトル検索 (GET /api/memos/search?q=...) - F-08 <-- ここを追加！
app.get("/search", memoController.searchMemos);
// 1. 全件取得 (GET /api/memos)
app.get("/", memoController.getAllMemos);
// 2. 作成 (POST /api/memos)
// ZodバリデーターでFormDataを検証
app.post("/", (0, zod_validator_1.zValidator)("form", memoValidator_1.createMemoSchema), memoController.createMemo);
// 3. 更新 (PUT /api/memos/:id)
app.put("/:id", memoController.updateMemo);
// 4. 削除 (DELETE /api/memos/:id)
app.delete("/:id", memoController.deleteMemo);
// 5. AI要約 (POST /api/memos/:id/summarize) - F-07
app.post("/:id/summarize", memoController.summarizeMemo);
exports.default = app;
