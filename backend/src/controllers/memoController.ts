import { Context } from "hono";
import { getAuth } from "@hono/clerk-auth"; // Clerkから認証情報を取る関数
import * as memoService from "../services/memoService";

export const getAllMemos = async (c: Context) => {
  const auth = getAuth(c);
  // ログインしていない場合、auth.userId は null になる
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    // userId をサービスに渡す
    const memos = await memoService.getMemos(auth.userId);
    return c.json(memos);
  } catch (error) {
    return c.json({ error: "Failed to fetch memos" }, 500);
  }
};

export const createMemo = async (c: Context) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const { title, content } = await c.req.json();
    const newMemo = await memoService.createMemo(auth.userId, title, content);
    return c.json(newMemo, 201);
  } catch (error) {
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
    return c.json({ error: "Failed to delete memo" }, 500);
  }
};
