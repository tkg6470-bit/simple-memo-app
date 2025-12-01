import { Context } from "hono";
import * as memoService from "../services/memoService";
import * as aiService from "../services/aiService";
import { getAuth } from "@hono/clerk-auth";

export const getAllMemos = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const memos = await memoService.getMemos(auth.userId);
    return c.json(memos);
  } catch (error) {
    console.error("Error in getAllMemos:", error); // ★エラーログを表示
    return c.json({ error: "Failed to fetch memos" }, 500);
  }
};

export const createMemo = async (c: Context) => {
  const auth = getAuth(c);

  // デバッグログ: ここで何が入っているか確認！
  console.log("【Debug】createMemo called");
  console.log("【Debug】Auth Object:", auth);
  console.log("【Debug】User ID:", auth?.userId);

  if (!auth?.userId) {
    console.error("【Error】User ID is missing!");
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { title, content } = await c.req.json();
    console.log("【Debug】Request Body:", { title, content });

    if (!title || !content) {
      return c.json({ error: "Title and content are required" }, 400);
    }

    const newMemo = await memoService.createMemo(auth.userId, title, content);
    console.log("【Debug】Memo Created Successfully:", newMemo);

    return c.json(newMemo, 201);
  } catch (error) {
    // エラーの中身を詳細に表示
    console.error("【Error】Create Memo Failed:", error);
    if (error instanceof Error) {
      console.error("【Error Details】", error.message);
      console.error("【Error Stack】", error.stack);
    }
    return c.json({ error: "Failed to create memo" }, 500);
  }
};

export const updateMemo = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const id = Number(c.req.param("id"));
    const { title, content } = await c.req.json();

    const updatedMemo = await memoService.updateMemo(
      auth.userId,
      id,
      title,
      content
    );
    return c.json(updatedMemo);
  } catch (error) {
    console.error("Error in updateMemo:", error); // ★エラーログを表示
    return c.json({ error: "Failed to update memo" }, 500);
  }
};

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
    console.error("Error in deleteMemo:", error); // ★エラーログを表示
    return c.json({ error: "Failed to delete memo" }, 500);
  }
};

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
    console.error("Error in summarizeMemo:", error); // ★エラーログを表示
    return c.json({ error: "Failed to summarize memo" }, 500);
  }
};
