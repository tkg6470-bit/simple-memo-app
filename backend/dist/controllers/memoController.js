"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeMemo = exports.deleteMemo = exports.updateMemo = exports.searchMemos = exports.createMemo = exports.getAllMemos = void 0;
const aiService_1 = require("../services/aiService");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAuthForTest = (c) => {
    return { userId: "test_user_123" };
};
const bigIntReplacer = (_key, value) => {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
};
// 1. 全件取得
const getAllMemos = async (c) => {
    const auth = getAuthForTest(c);
    if (!auth?.userId)
        return c.json({ error: "Unauthorized" }, 401);
    try {
        const memos = await prisma.memo.findMany({
            where: { userId: auth.userId },
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
    const auth = getAuthForTest(c);
    if (!auth?.userId)
        return c.json({ error: "Unauthorized" }, 401);
    try {
        const body = await c.req.parseBody();
        const title = body["title"];
        const content = body["content"];
        if (!title || !content) {
            return c.json({ error: "Title and content are required" }, 400);
        }
        const memo = await prisma.memo.create({
            data: { title, content, userId: auth.userId },
        });
        const vectorText = `${title}\n${content}`;
        const embedding = await aiService_1.aiService.generateEmbedding(vectorText);
        const vectorString = JSON.stringify(embedding);
        await prisma.$executeRaw `
      UPDATE "memos"
      SET "embedding" = ${vectorString}::vector
      WHERE "id" = ${memo.id}
    `;
        return c.json(memo, 201);
    }
    catch (error) {
        return c.json({ error: "Failed to create memo", details: String(error) }, 500);
    }
};
exports.createMemo = createMemo;
// 3. ベクトル検索 (GET /api/memos/search)
const searchMemos = async (c) => {
    console.log(">>> [DEBUG] Search Endpoint Hit");
    const auth = getAuthForTest(c);
    if (!auth?.userId)
        return c.json({ error: "Unauthorized" }, 401);
    const query = c.req.query("q");
    if (!query)
        return c.json({ error: "Query parameter 'q' is required" }, 400);
    try {
        const vector = await aiService_1.aiService.generateEmbedding(query);
        const vectorString = JSON.stringify(vector);
        // デバッグ: 2パターンのカラム名で検索を試行
        let results = [];
        try {
            results = await prisma.$queryRaw `
        SELECT id, title, content, created_at, updated_at, image_url,
               1 - ("embedding" <=> ${vectorString}::vector) AS similarity
        FROM "memos"
        WHERE "user_id" = ${auth.userId} AND "embedding" IS NOT NULL
        ORDER BY similarity DESC
        LIMIT 10;
      `;
        }
        catch (e) {
            console.log(">>> [DEBUG] user_id failed, trying userId...");
            results = await prisma.$queryRaw `
        SELECT id, title, content, created_at, updated_at, image_url,
               1 - ("embedding" <=> ${vectorString}::vector) AS similarity
        FROM "memos"
        WHERE "userId" = ${auth.userId} AND "embedding" IS NOT NULL
        ORDER BY similarity DESC
        LIMIT 10;
      `;
        }
        const safeResults = JSON.parse(JSON.stringify(results, bigIntReplacer));
        // 結果が見つかっても見つからなくても、必ずこの形式で返す
        return c.json({
            success: true,
            query: query,
            count: safeResults.length,
            results: safeResults,
        });
    }
    catch (error) {
        console.error(">>> [DEBUG] Error:", error);
        return c.json({ error: "AI search failed.", details: String(error) }, 500);
    }
};
exports.searchMemos = searchMemos;
// --- その他 ---
const updateMemo = async (c) => c.json({});
exports.updateMemo = updateMemo;
const deleteMemo = async (c) => c.json({});
exports.deleteMemo = deleteMemo;
const summarizeMemo = async (c) => c.json({});
exports.summarizeMemo = summarizeMemo;
