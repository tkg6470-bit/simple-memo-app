// backend/src/schemas/memoParams.ts
import { z } from "zod";

// メモ作成時の入力スキーマ (FormData)
export const createMemoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  // 画像は "File" オブジェクト、または未送信(undefined)
  // ブラウザからのFormDataの場合、File型として受け取ります
  image: z.instanceof(File).optional().or(z.any()),
});

// 検索時のクエリストリング
export const searchMemoSchema = z.object({
  q: z.string().min(1),
});
