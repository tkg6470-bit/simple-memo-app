import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { getAuth } from "@hono/clerk-auth";
import { PrismaClient } from "@prisma/client";
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
      // 修正: エラー変数をログに出力して使用済みにする
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
      // 修正: エラー変数をログに出力
      console.error(error);
      return c.json({ error: "Search failed" }, 500);
    }
  })
  .put("/:id", async (c) => {
    return c.json({ success: true });
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
      // 修正: エラー変数をログに出力
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
