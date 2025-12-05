"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeMemo = exports.deleteMemo = exports.updateMemo = exports.searchMemos = exports.createMemo = exports.getAllMemos = void 0;
const clerk_auth_1 = require("@hono/clerk-auth"); // 👈 Clerkから情報を取る関数
const aiService_1 = require("../services/aiService");
const storageService_1 = require("../services/storageService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// ビッグイン整数(BigInt)をJSONにするための変換ヘルパー
const bigIntReplacer = (_key, value) => {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
};
// ▼▼▼ 認証ヘルパー関数 (本番用) ▼▼▼
const getAuthUser = (c) => {
    const auth = (0, clerk_auth_1.getAuth)(c);
    // userId がない = ログインしていない
    if (!auth?.userId) {
        return null;
    }
    return { userId: auth.userId };
};
// 1. 全件取得
const getAllMemos = async (c) => {
    const auth = getAuthUser(c); // 👈 本物のIDを取得
    if (!auth)
        return c.json({ error: "Unauthorized" }, 401);
    try {
        const memos = await prisma.memo.findMany({
            where: { userId: auth.userId }, // その人のメモだけ取得
            orderBy: { createdAt: "desc" },
        });
        return c.json(memos);
    }
    catch (error) {
        return c.json({ error: "Failed to fetch memos", details: String(error) }, 500);
    }
};
exports.getAllMemos = getAllMemos;
// 2. 作成
const createMemo = async (c) => {
    console.log(">>> [DEBUG] createMemo called");
    const auth = getAuthUser(c); // 👈 本物のIDを取得
    if (!auth)
        return c.json({ error: "Unauthorized" }, 401);
    try {
        const body = await c.req.parseBody();
        const title = body["title"];
        const content = body["content"];
        const image = body["image"];
        if (!title || !content) {
            return c.json({ error: "Title and content are required" }, 400);
        }
        let imageUrl = null;
        // ダックタイピングによるファイル判定
        const isFile = image &&
            typeof image === "object" &&
            "arrayBuffer" in image &&
            typeof image.arrayBuffer === "function";
        if (isFile) {
            console.log(">>> [DEBUG] File detected via Duck Typing! Starting upload...");
            const file = image;
            // ファイル名サニタイズ
            const ext = file.name ? file.name.split(".").pop() : "png";
            const safeFileName = `${Date.now()}_${Math.random()
                .toString(36)
                .substring(7)}.${ext}`;
            const mimeType = file.type || "application/octet-stream";
            // ユーザーIDごとのフォルダに保存されるようになります
            const key = `${auth.userId}/${safeFileName}`;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            console.log(">>> [DEBUG] Uploading to Bucket:", process.env.AWS_BUCKET_NAME);
            await (0, storageService_1.uploadImage)(key, buffer, mimeType);
            const publicEndpoint = process.env.AWS_ENDPOINT?.replace("/storage/v1/s3", "/storage/v1/object/public");
            imageUrl = `${publicEndpoint}/${process.env.AWS_BUCKET_NAME}/${key}`;
            console.log(">>> [DEBUG] Upload success. URL:", imageUrl);
        }
        // DB保存
        const memo = await prisma.memo.create({
            data: {
                title,
                content,
                userId: auth.userId, // ログインユーザーのIDで保存
                imageUrl: imageUrl,
            },
        });
        // ベクトル生成 (エラーでも続行)
        try {
            const vectorText = `${title}\n${content}`;
            const embedding = await aiService_1.aiService.generateEmbedding(vectorText);
            const vectorString = JSON.stringify(embedding);
            await prisma.$executeRaw `
        UPDATE "memos"
        SET "embedding" = ${vectorString}::vector
        WHERE "id" = ${memo.id}
      `;
        }
        catch (e) {
            console.error(">>> [DEBUG] Vector generation failed (ignored):", e);
        }
        return c.json(memo, 201);
    }
    catch (error) {
        console.error(">>> [DEBUG] Create memo failed:", error);
        return c.json({ error: "Failed to create memo", details: String(error) }, 500);
    }
};
exports.createMemo = createMemo;
// 3. ベクトル検索
const searchMemos = async (c) => {
    const auth = getAuthUser(c); // 👈 本物のIDを取得
    if (!auth)
        return c.json({ error: "Unauthorized" }, 401);
    const query = c.req.query("q");
    if (!query)
        return c.json({ error: "Query parameter 'q' is required" }, 400);
    try {
        const vector = await aiService_1.aiService.generateEmbedding(query);
        const vectorString = JSON.stringify(vector);
        // SQL内で user_id = auth.userId を指定して他人のメモを除外
        const results = await prisma.$queryRaw `
        SELECT id, title, content, created_at, updated_at, image_url,
               1 - ("embedding" <=> ${vectorString}::vector) AS similarity
        FROM "memos"
        WHERE "userId" = ${auth.userId} AND "embedding" IS NOT NULL
        ORDER BY similarity DESC
        LIMIT 10;
    `;
        const safeResults = JSON.parse(JSON.stringify(results, bigIntReplacer));
        return c.json({
            success: true,
            query: query,
            count: safeResults.length,
            results: safeResults,
        });
    }
    catch (error) {
        return c.json({ error: "AI search failed.", details: String(error) }, 500);
    }
};
exports.searchMemos = searchMemos;
// 4. 更新
const updateMemo = async (c) => {
    const auth = getAuthUser(c);
    if (!auth)
        return c.json({ error: "Unauthorized" }, 401);
    // 実装が必要ならここに記述 (userIdチェック必須)
    return c.json({});
};
exports.updateMemo = updateMemo;
// 5. 削除
const deleteMemo = async (c) => {
    const auth = getAuthUser(c);
    if (!auth)
        return c.json({ error: "Unauthorized" }, 401);
    // 実装が必要ならここに記述 (userIdチェック必須)
    return c.json({});
};
exports.deleteMemo = deleteMemo;
// 6. 要約 (Mock)
const summarizeMemo = async (c) => {
    console.log(">>> [DEBUG] summarizeMemo called (Mock Mode)");
    // ダミー待機
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return c.json({
        summary: "【ダミー要約】これはテスト用のレスポンスです。OpenAI APIの課金を防ぐため、実際のAI処理はスキップされました。ここに本来は要約文が入ります。",
    });
};
exports.summarizeMemo = summarizeMemo;
