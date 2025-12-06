import { Context } from "hono";
import { getAuth } from "@hono/clerk-auth"; // 👈 Clerkから情報を取る関数
import { aiService } from "../services/aiService";
import { uploadImage } from "../services/storageService";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ビッグイン整数(BigInt)をJSONにするための変換ヘルパー
// ▼▼▼ 修正: anyの使用を許可 ▼▼▼
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bigIntReplacer = (_key: string, value: any) => {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

// ▼▼▼ 認証ヘルパー関数 (本番用) ▼▼▼
const getAuthUser = (c: Context) => {
  const auth = getAuth(c);
  // userId がない = ログインしていない
  if (!auth?.userId) {
    return null;
  }
  return { userId: auth.userId };
};

// 1. 全件取得
export const getAllMemos = async (c: Context) => {
  const auth = getAuthUser(c); // 👈 本物のIDを取得
  if (!auth) return c.json({ error: "Unauthorized" }, 401);

  try {
    const memos = await prisma.memo.findMany({
      where: { userId: auth.userId }, // その人のメモだけ取得
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

// 2. 作成
export const createMemo = async (c: Context) => {
  console.log(">>> [DEBUG] createMemo called");

  const auth = getAuthUser(c); // 👈 本物のIDを取得
  if (!auth) return c.json({ error: "Unauthorized" }, 401);

  try {
    // ▼▼▼ 修正: anyの使用を許可 (parseBodyの戻り値がanyのため) ▼▼▼
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body = await c.req.parseBody();
    const title = body["title"] as string;
    const content = body["content"] as string;
    const image = body["image"];

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    let imageUrl: string | null = null;

    // ダックタイピングによるファイル判定
    const isFile =
      image &&
      typeof image === "object" &&
      "arrayBuffer" in image &&
      // ▼▼▼ 修正: anyの使用を許可 (ダックタイピングのため) ▼▼▼
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typeof (image as any).arrayBuffer === "function";

    if (isFile) {
      console.log(
        ">>> [DEBUG] File detected via Duck Typing! Starting upload..."
      );
      const file = image as File;

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

      console.log(
        ">>> [DEBUG] Uploading to Bucket:",
        process.env.AWS_BUCKET_NAME
      );

      await uploadImage(key, buffer, mimeType);

      const publicEndpoint = process.env.AWS_ENDPOINT?.replace(
        "/storage/v1/s3",
        "/storage/v1/object/public"
      );
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
      const embedding = await aiService.generateEmbedding(vectorText);
      const vectorString = JSON.stringify(embedding);

      await prisma.$executeRaw`
        UPDATE "memos"
        SET "embedding" = ${vectorString}::vector
        WHERE "id" = ${memo.id}
      `;
    } catch (e) {
      console.error(">>> [DEBUG] Vector generation failed (ignored):", e);
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
  const auth = getAuthUser(c); // 👈 本物のIDを取得
  if (!auth) return c.json({ error: "Unauthorized" }, 401);

  const query = c.req.query("q");
  if (!query) return c.json({ error: "Query parameter 'q' is required" }, 400);

  try {
    const vector = await aiService.generateEmbedding(query);
    const vectorString = JSON.stringify(vector);

    // SQL内で user_id = auth.userId を指定して他人のメモを除外
    const results = await prisma.$queryRaw`
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
  } catch (error) {
    return c.json({ error: "AI search failed.", details: String(error) }, 500);
  }
};

// 4. 更新
export const updateMemo = async (c: Context) => {
  const auth = getAuthUser(c);
  if (!auth) return c.json({ error: "Unauthorized" }, 401);
  // 実装が必要ならここに記述 (userIdチェック必須)
  return c.json({});
};

// 5. 削除
export const deleteMemo = async (c: Context) => {
  const auth = getAuthUser(c);
  if (!auth) return c.json({ error: "Unauthorized" }, 401);
  // 実装が必要ならここに記述 (userIdチェック必須)
  return c.json({});
};

// 6. 要約 (Mock)
export const summarizeMemo = async (c: Context) => {
  console.log(">>> [DEBUG] summarizeMemo called (Mock Mode)");
  // ダミー待機
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return c.json({
    summary:
      "【ダミー要約】これはテスト用のレスポンスです。OpenAI APIの課金を防ぐため、実際のAI処理はスキップされました。ここに本来は要約文が入ります。",
  });
};
