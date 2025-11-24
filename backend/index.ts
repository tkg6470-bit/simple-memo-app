// backend/index.ts
import express, { Request, Response } from "express";
import { Pool } from "pg";
import cors from "cors"; // フロントエンドからの通信を許可するライブラリ

const app = express();
const PORT = process.env.PORT || 8080;

// ミドルウェアの設定
app.use(cors()); // CORSを有効化 (これが重要！)
app.use(express.json()); // JSONボディをパースする

// ★ データベース接続設定
const pool = new Pool({
  user: process.env.DB_USER || "user",
  host: process.env.DB_HOST || "db",
  database: process.env.DB_NAME || "memo_app_db",
  password: process.env.DB_PASSWORD || "password",
  port: parseInt(process.env.DB_PORT || "5432"),
});

// テーブル作成関数
const createMemosTable = async () => {
  try {
    const client = await pool.connect();
    const query = `
      CREATE TABLE IF NOT EXISTS memos (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await client.query(query);
    client.release();
    console.log("PostgreSQL: Memos table checked/created successfully.");
  } catch (err) {
    console.error("Error creating memos table or connecting to DB:", err);
    process.exit(1);
  }
};

// =========================================================
// APIルート
// =========================================================

app.get("/", (req: Request, res: Response) => {
  res.send("Memo Backend API is running!");
});

// 1. CREATE: メモの作成
app.post("/api/memos", async (req: Request, res: Response) => {
  const { title, content } = req.body;
  if (!title || !content)
    return res.status(400).json({ error: "Required fields missing" });
  try {
    const result = await pool.query(
      "INSERT INTO memos (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 2. READ (List): メモ一覧取得
app.get("/api/memos", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM memos ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 3. READ (Detail): メモ詳細取得
app.get("/api/memos/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query("SELECT * FROM memos WHERE id = $1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Memo not found" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 4. UPDATE: メモ更新
app.put("/api/memos/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { title, content } = req.body;
    const result = await pool.query(
      "UPDATE memos SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *",
      [title, content, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Memo not found" });
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// 5. DELETE: メモ削除
app.delete("/api/memos/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const result = await pool.query(
      "DELETE FROM memos WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Memo not found" });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

const startServer = async () => {
  await createMemosTable();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
