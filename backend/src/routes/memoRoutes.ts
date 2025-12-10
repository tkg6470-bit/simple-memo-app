import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getAuth } from "@hono/clerk-auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod"; // 追加: zodのインポート
import { aiService } from "../services/aiService";
import { uploadImage } from "../services/storageService";
import { createMemoSchema, searchMemoSchema } from "../schemas/memoParams";

const app = new Hono();
const prisma = new PrismaClient();

// --- ヘルパー関数 ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bigIntReplacer = (_key: string, value: any) => {
  return typeof value === "bigint" ? value.toString() : value;
};

// 認証ヘルパー
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAuthUser = (c: any) => {
  const auth = getAuth(c);
  if (!auth?.userId) return null;
  return { userId: auth.userId };
};

// --- スキーマ定義 ---

// 更新用スキーマ (画像は任意)
const updateMemoSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  content: z.string().min(1, "本文は必須です"),
  image: z.instanceof(File).optional(),
});

// --- ルート定義 (RPC Chain) ---

const route = app
  .get("/", async (c) => {
    const auth = getAuthUser(c);
    if (!auth) return c.json({ error: "Unauthorized" }, 401);

    try {
      const memos = await prisma.memo.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: "desc" },
      });
      return c.json(memos, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to fetch" }, 500);
    }
  })
  .post("/", zValidator("form", createMemoSchema), async (c) => {
    const auth = getAuthUser(c);
    if (!auth) return c.json({ error: "Unauthorized" }, 401);

    const { title, content, image } = c.req.valid("form");

    try {
      let imageUrl: string | null = null;

      if (image && image instanceof File) {
        const file = image;
        const ext = file.name ? file.name.split(".").pop() : "png";
        const safeFileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${ext}`;
        const key = `${auth.userId}/${safeFileName}`;
        const mimeType = file.type || "application/octet-stream";

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // MinIO (S3) にアップロード
        await uploadImage(key, buffer, mimeType);

        // 画像URLの生成ロジック
        const rawEndpoint = process.env.AWS_ENDPOINT || "";
        let publicEndpoint = "";

        if (rawEndpoint.includes("minio") || !rawEndpoint) {
          publicEndpoint = "http://localhost:9000";
        } else {
          publicEndpoint = rawEndpoint.replace(
            "/storage/v1/s3",
            "/storage/v1/object/public"
          );
        }

        const bucketName = process.env.AWS_BUCKET_NAME || "memo-bucket";
        imageUrl = `${publicEndpoint}/${bucketName}/${key}`;
      }

      const memo = await prisma.memo.create({
        data: {
          title,
          content,
          userId: auth.userId,
          imageUrl,
        },
      });

      // ベクトル生成 (バックグラウンド)
      (async () => {
        try {
          const embedding = await aiService.generateEmbedding(
            `${title}\n${content}`
          );
          await prisma.$executeRaw`
            UPDATE "memos" SET "embedding" = ${JSON.stringify(
              embedding
            )}::vector WHERE "id" = ${memo.id}
          `;
        } catch (e) {
          console.error("Vector generation failed:", e);
        }
      })();

      return c.json(memo, 201);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to create memo" }, 500);
    }
  })
  .get("/search", zValidator("query", searchMemoSchema), async (c) => {
    const auth = getAuthUser(c);
    if (!auth) return c.json({ error: "Unauthorized" }, 401);

    const { q } = c.req.valid("query");

    try {
      const vector = await aiService.generateEmbedding(q);
      const vectorString = JSON.stringify(vector);

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
        count: safeResults.length,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        results: safeResults as any[],
      });
    } catch (error) {
      console.error(error);
      return c.json({ error: "Search failed" }, 500);
    }
  })
  // ▼▼▼ メモ編集 (PUT) の実装 ▼▼▼
  .put("/:id", zValidator("form", updateMemoSchema), async (c) => {
    const auth = getAuthUser(c);
    if (!auth) return c.json({ error: "Unauthorized" }, 401);

    const id = Number(c.req.param("id")); // IDを数値に変換
    const { title, content, image } = c.req.valid("form");

    try {
      // 1. 存在確認と権限チェック
      const currentMemo = await prisma.memo.findUnique({
        where: { id },
      });

      if (!currentMemo) {
        return c.json({ error: "Memo not found" }, 404);
      }
      if (currentMemo.userId !== auth.userId) {
        return c.json({ error: "Unauthorized update" }, 403);
      }

      let imageUrl = currentMemo.imageUrl;

      // 2. 画像がアップロードされた場合のみ更新処理 (POSTと同様のロジック)
      if (image && image instanceof File) {
        const file = image;
        const ext = file.name ? file.name.split(".").pop() : "png";
        const safeFileName = `${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.${ext}`;
        const key = `${auth.userId}/${safeFileName}`;
        const mimeType = file.type || "application/octet-stream";

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await uploadImage(key, buffer, mimeType);

        const rawEndpoint = process.env.AWS_ENDPOINT || "";
        let publicEndpoint = "";

        if (rawEndpoint.includes("minio") || !rawEndpoint) {
          publicEndpoint = "http://localhost:9000";
        } else {
          publicEndpoint = rawEndpoint.replace(
            "/storage/v1/s3",
            "/storage/v1/object/public"
          );
        }

        const bucketName = process.env.AWS_BUCKET_NAME || "memo-bucket";
        imageUrl = `${publicEndpoint}/${bucketName}/${key}`;
      }

      // 3. データベース更新
      const updatedMemo = await prisma.memo.update({
        where: { id },
        data: {
          title,
          content,
          imageUrl,
        },
      });

      // 4. ベクトル再生成 (内容が変わったため)
      (async () => {
        try {
          const embedding = await aiService.generateEmbedding(
            `${title}\n${content}`
          );
          await prisma.$executeRaw`
            UPDATE "memos" SET "embedding" = ${JSON.stringify(
              embedding
            )}::vector WHERE "id" = ${id}
          `;
        } catch (e) {
          console.error("Vector update failed:", e);
        }
      })();

      return c.json(updatedMemo, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: "Failed to update memo" }, 500);
    }
  })
  .delete("/:id", async (c) => {
    const auth = getAuthUser(c);
    if (!auth) return c.json({ error: "Unauthorized" }, 401);
    const id = Number(c.req.param("id"));
    try {
      await prisma.memo.delete({
        where: { id, userId: auth.userId },
      });
      return c.json({ success: true });
    } catch (e) {
      console.error(e);
      return c.json({ error: "Failed to delete" }, 500);
    }
  })
  .post("/:id/summarize", async (c) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return c.json({
      summary: "【AI要約】これはHono RPC経由で取得された要約テキストです。",
    });
  });

export const memoRouter = route;
