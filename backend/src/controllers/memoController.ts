import { Context } from "hono";
import { aiService } from "../services/aiService";
import { uploadImage } from "../services/storageService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAuthForTest = (c: Context) => {
  return { userId: "test_user_123" };
};

const bigIntReplacer = (_key: string, value: any) => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

// 1. 全件取得
export const getAllMemos = async (c: Context) => {
  const auth = getAuthForTest(c);
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const memos = await prisma.memo.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
    });
    return c.json(memos);
  } catch (error) {
    return c.json(
      { error: "Failed to fetch memos", details: String(error) },
      500
    );
  }
};

// 2. 作成 (日本語ファイル名対策版)
export const createMemo = async (c: Context) => {
  console.log(">>> [DEBUG] createMemo called");

  const auth = getAuthForTest(c);
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.parseBody();
    const title = body["title"] as string;
    const content = body["content"] as string;
    const image = body["image"];

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    let imageUrl: string | null = null;

    // Duck Typing判定
    const isFile =
      image &&
      typeof image === "object" &&
      "arrayBuffer" in image &&
      typeof (image as any).arrayBuffer === "function";

    if (isFile) {
      console.log(">>> [DEBUG] File detected! Processing safe filename...");
      const file = image as File;

      // 💡 修正ポイント: 日本語ファイル名を禁止し、ランダムな英数字にする
      const ext = file.name ? file.name.split(".").pop() : "png";
      const safeFileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(7)}.${ext}`;

      const mimeType = file.type || "application/octet-stream";
      const key = `${auth.userId}/${safeFileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(">>> [DEBUG] Uploading as:", key);

      await uploadImage(key, buffer, mimeType);

      const publicEndpoint = process.env.AWS_ENDPOINT?.replace(
        "/storage/v1/s3",
        "/storage/v1/object/public"
      );
      imageUrl = `${publicEndpoint}/${process.env.AWS_BUCKET_NAME}/${key}`;
      console.log(">>> [DEBUG] Upload success. URL:", imageUrl);
    } else {
      console.log(">>> [DEBUG] No file detected or invalid format.");
    }

    const memo = await prisma.memo.create({
      data: {
        title,
        content,
        userId: auth.userId,
        imageUrl: imageUrl,
      },
    });

    try {
      const vectorText = `${title}\n${content}`;
      const embedding = await aiService.generateEmbedding(vectorText);
      const vectorString = JSON.stringify(embedding);
      await prisma.$executeRaw`
        UPDATE "memos" 
        SET "embedding" = ${vectorString}::vector 
        WHERE "id" = ${memo.id}
      `;
    } catch (e) {
      console.error(">>> [DEBUG] Vector error (ignored):", e);
    }

    return c.json(memo, 201);
  } catch (error) {
    console.error(">>> [DEBUG] Create memo failed:", error);
    return c.json(
      { error: "Failed to create memo", details: String(error) },
      500
    );
  }
};

// 3. ベクトル検索
export const searchMemos = async (c: Context) => {
  const auth = getAuthForTest(c);
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

  const query = c.req.query("q");
  if (!query) return c.json({ error: "Query parameter 'q' is required" }, 400);

  try {
    const vector = await aiService.generateEmbedding(query);
    const vectorString = JSON.stringify(vector);

    let results: any[] = [];
    try {
      results = await prisma.$queryRaw`
        SELECT id, title, content, created_at, updated_at, image_url,
               1 - ("embedding" <=> ${vectorString}::vector) AS similarity
        FROM "memos"
        WHERE "user_id" = ${auth.userId} AND "embedding" IS NOT NULL
        ORDER BY similarity DESC
        LIMIT 10;
      `;
    } catch (e) {
      results = await prisma.$queryRaw`
        SELECT id, title, content, created_at, updated_at, image_url,
               1 - ("embedding" <=> ${vectorString}::vector) AS similarity
        FROM "memos"
        WHERE "userId" = ${auth.userId} AND "embedding" IS NOT NULL
        ORDER BY similarity DESC
        LIMIT 10;
      `;
    }

    const safeResults = JSON.parse(JSON.stringify(results, bigIntReplacer));

    return c.json({
      success: true,
      query: query,
      count: safeResults.length,
      results: safeResults,
    });
  } catch (error) {
    return c.json({ error: "AI search failed.", details: String(error) }, 500);
  }
};

export const updateMemo = async (c: Context) => c.json({});
export const deleteMemo = async (c: Context) => c.json({});
export const summarizeMemo = async (c: Context) => c.json({});
