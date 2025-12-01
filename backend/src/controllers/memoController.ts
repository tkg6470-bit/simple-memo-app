import { Context } from 'hono';
import * as memoService from '../services/memoService';

export const getAllMemos = async (c: Context) => {
  try {
    const memos = await memoService.getMemos();
    return c.json(memos);
  } catch (error) {
    return c.json({ error: 'Failed to fetch memos' }, 500);
  }
};

export const createMemo = async (c: Context) => {
  try {
    const { title, content } = await c.req.json();
    if (!title || !content) {
      return c.json({ error: 'Title and content are required' }, 400);
    }
    const newMemo = await memoService.createMemo(title, content);
    return c.json(newMemo, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create memo' }, 500);
  }
};

export const updateMemo = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    const { title, content } = await c.req.json();
    const updatedMemo = await memoService.updateMemo(id, title, content);
    return c.json(updatedMemo);
  } catch (error) {
    return c.json({ error: 'Failed to update memo' }, 500);
  }
};

export const deleteMemo = async (c: Context) => {
  try {
    const id = Number(c.req.param('id'));
    await memoService.deleteMemo(id);
    return c.status(204).text('');
  } catch (error) {
    return c.json({ error: 'Failed to delete memo' }, 500);
  }
};