import { Request, Response } from 'express';
import * as memoService from '../services/memoService';

export const getAllMemos = async (req: Request, res: Response) => {
  try {
    const memos = await memoService.getMemos();
    res.json(memos);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch memos' });
  }
};

export const createMemo = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    const newMemo = await memoService.createMemo(title, content);
    res.json(newMemo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create memo' });
  }
};

export const updateMemo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body;
    const updatedMemo = await memoService.updateMemo(id, title, content);
    res.json(updatedMemo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update memo' });
  }
};

export const deleteMemo = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await memoService.deleteMemo(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete memo' });
  }
};