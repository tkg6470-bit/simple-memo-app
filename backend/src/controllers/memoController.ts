import { Context } from "hono";
import { aiService } from "../services/aiService";
import { uploadImage } from "../services/storageService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getAuthForTest = (c: Context) => {
  // 本来は c.get('auth') などでClerkの情報を取ります
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

// 2. 作成 (デバッグログ追加版)
export const createMemo = async (c: Context) => {
  console.log(">>> [DEBUG] createMemo called");

  const auth = getAuthForTest(c);
  if (!auth?.userId) return c.json({ error: "Unauthorized" }, 401);

  try {
    const body = await c.req.parseBody();
    const title = body["title"] as string;
    const content = body["content"] as string;
    const image = body["image"];

    // ▼▼▼ 受信データの中身を確認 ▼▼▼
    console.log(">>> [DEBUG] Body received:", { title, content });
    console.log(">>> [DEBUG] Image raw type:", typeof image);

    // imageがFileオブジェクトかどうか詳しく見る
    if (image && typeof image === "object") {
      console.log(">>> [DEBUG] Image object keys:", Object.keys(image));
      console.log(">>> [DEBUG] Is File instance?:", image instanceof File);
      if (image instanceof File) {
        console.log(">>> [DEBUG] File details:", {
          name: image.name,
          size: image.size,
          type: image.type,
        });
      }
    } else {
      console.log(">>> [DEBUG] Image is not an object or null");
    }

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    let imageUrl: string | null = null;

    // ▼▼▼ 画像アップロード処理 ▼▼▼
    if (image instanceof File && image.size > 0) {
      console.log(">>> [DEBUG] Start uploading image process...");

      const fileExtension = image.name.split(".").pop() || "png";
      const mimeType = image.type;
      const fileName = `${Date.now()}_${image.name}`;
      const key = `${auth.userId}/${fileName}`;

      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 環境変数が取れているか確認
      console.log(
        ">>> [DEBUG] Env Check - AWS_BUCKET_NAME:",
        process.env.AWS_BUCKET_NAME
      );
      console.log(
        ">>> [DEBUG] Env Check - AWS_REGION:",
        process.env.AWS_REGION
      );

      try {
        await uploadImage(key, buffer, mimeType);
        console.log(">>> [DEBUG] Upload to Supabase success!");
      } catch (uploadError) {
        console.error(
          ">>> [DEBUG] Upload failed inside uploadImage:",
          uploadError
        );
        throw uploadError; // ここでエラーを投げて下のcatchブロックで拾う
      }

      const publicEndpoint = process.env.AWS_ENDPOINT?.replace(
        "/storage/v1/s3",
        "/storage/v1/object/public"
      );
      imageUrl = `${publicEndpoint}/${process.env.AWS_BUCKET_NAME}/${key}`;
      console.log(">>> [DEBUG] Generated Image URL:", imageUrl);
    } else {
      console.log(
        ">>> [DEBUG] Image upload skipped. Reason: Not a File instance or size is 0"
      );
    }

    // DB保存
    const memo = await prisma.memo.create({
      data: {
        title,
        content,
        userId: auth.userId,
        imageUrl: imageUrl,
      },
    });

    // ベクトル生成・保存
    const vectorText = `${title}\n${content}`;
    const embedding = await aiService.generateEmbedding(vectorText);
    const vectorString = JSON.stringify(embedding);

    await prisma.$executeRaw`
      UPDATE "memos"
      SET "embedding" = ${vectorString}::vector
      WHERE "id" = ${memo.id}
    `;

    return c.json(memo, 201);
  } catch (error) {
    console.error(">>> [DEBUG] Create memo failed (Catch Block):", error);
    return c.json(
      { error: "Failed to create memo", details: String(error) },
      500
    );
  }
};

// 3. ベクトル検索
export const searchMemos = async (c: Context) => {
  console.log(">>> [DEBUG] Search Endpoint Hit");
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
      console.log(">>> [DEBUG] user_id failed, trying userId...");
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
    console.error(">>> [DEBUG] Error:", error);
    return c.json({ error: "AI search failed.", details: String(error) }, 500);
  }
};

// --- その他 ---
export const updateMemo = async (c: Context) => c.json({});
export const deleteMemo = async (c: Context) => c.json({});
export const summarizeMemo = async (c: Context) => c.json({});
