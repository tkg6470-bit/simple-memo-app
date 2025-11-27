import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8080;

// ミドルウェア
app.use(cors()); // フロントエンドからのアクセスを許可
app.use(express.json()); // JSONを受け取れるようにする

// 動作確認用
app.get("/", (req: Request, res: Response) => {
  res.send("Memo App Backend with Prisma is running!");
});

// =========================================================
// APIルート (Prisma版)
// =========================================================

// 1. READ (List): メモ一覧取得
app.get("/memos", async (req: Request, res: Response) => {
  try {
    const memos = await prisma.memo.findMany({
      orderBy: {
        created_at: "desc", // 作成日時の新しい順
      },
    });
    res.json(memos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch memos" });
  }
});

// 2. CREATE: メモ作成
app.post("/memos", async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;

    // バリデーション（簡易）
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const newMemo = await prisma.memo.create({
      data: {
        title,
        content,
      },
    });
    res.json(newMemo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create memo" });
  }
});

// 3. UPDATE: メモ更新
app.put("/memos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const updatedMemo = await prisma.memo.update({
      where: { id: Number(id) },
      data: {
        title,
        content,
      },
    });
    res.json(updatedMemo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update memo" });
  }
});

// 4. DELETE: メモ削除
app.delete("/memos/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.memo.delete({
      where: { id: Number(id) },
    });
    res.status(204).send(); // 204 No Content (成功したが返す中身はない)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete memo" });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
