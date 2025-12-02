import { Context } from "hono";
import * as memoService from "../services/memoService";
import * as aiService from "../services/aiService";
import * as storageService from "../services/storageService"; // 追加
import { getAuth } from "@hono/clerk-auth";

// 1. 全件取得
export const getAllMemos = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const memos = await memoService.getMemos(auth.userId);
    return c.json(memos);
  } catch (error) {
    console.error("Error in getAllMemos:", error);
    return c.json({ error: "Failed to fetch memos" }, 500);
  }
};

// 2. 作成 (画像アップロード対応)
export const createMemo = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // 画像を含むため、JSONではなく FormData として受け取る
    const body = await c.req.parseBody();
    const title = body["title"] as string;
    const content = body["content"] as string;
    const imageFile = body["image"]; // ファイルを取得

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    let imageUrl: string | undefined = undefined;

    // 画像ファイルがあればアップロード
    if (imageFile && imageFile instanceof File) {
      imageUrl = await storageService.uploadImage(imageFile, imageFile.type);
    }

    // DBに保存 (imageUrl も渡す)
    const newMemo = await memoService.createMemo(
      auth.userId,
      title,
      content,
      imageUrl
    );
    return c.json(newMemo, 201);
  } catch (error) {
    console.error("Error in createMemo:", error);
    return c.json({ error: "Failed to create memo" }, 500);
  }
};

// 3. 更新 (画像アップロード対応)
export const updateMemo = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const id = Number(c.req.param("id"));
    const body = await c.req.parseBody();
    const title = body["title"] as string;
    const content = body["content"] as string;
    const imageFile = body["image"];

    let imageUrl: string | undefined = undefined;

    if (imageFile && imageFile instanceof File) {
      imageUrl = await storageService.uploadImage(imageFile, imageFile.type);
    }

    const updatedMemo = await memoService.updateMemo(
      auth.userId,
      id,
      title,
      content,
      imageUrl
    );
    return c.json(updatedMemo);
  } catch (error) {
    console.error("Error in updateMemo:", error);
    return c.json({ error: "Failed to update memo" }, 500);
  }
};

// 4. 削除
export const deleteMemo = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const id = Number(c.req.param("id"));
    await memoService.deleteMemo(auth.userId, id);
    return c.body(null, 204);
  } catch (error) {
    console.error("Error in deleteMemo:", error);
    return c.json({ error: "Failed to delete memo" }, 500);
  }
};

// 5. AI要約
export const summarizeMemo = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const id = Number(c.req.param("id"));

    const memos = await memoService.getMemos(auth.userId);
    const targetMemo = memos.find((m) => m.id === id);

    if (!targetMemo) {
      return c.json({ error: "Memo not found" }, 404);
    }

    const summary = await aiService.summarizeText(targetMemo.content);
    return c.json({ summary });
  } catch (error) {
    console.error("Error in summarizeMemo:", error);
    return c.json({ error: "Failed to summarize memo" }, 500);
  }
};
