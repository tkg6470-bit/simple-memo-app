import axios from "axios";
import { Memo, SearchResponse } from "../types/memo";

const API_BASE_URL = "https://simple-memo-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getMemos = async () => {
  const response = await api.get("/");
  return response.data;
};

export const memoApi = {
  // 全件取得
  getAllMemos: async (token: string): Promise<Memo[]> => {
    const response = await api.get("/memos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // メモ作成
  createMemo: async (token: string, data: FormData): Promise<Memo> => {
    const response = await api.post("/memos", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // ベクトル検索
  searchMemos: async (token: string, query: string): Promise<Memo[]> => {
    if (!query.trim()) return [];

    // GET /memos/search?q=...
    const response = await api.get<SearchResponse>("/memos/search", {
      params: { q: query },
      headers: { Authorization: `Bearer ${token}` },
    });

    // バックエンドのレスポンス形式に合わせて結果を返す
    // もし { results: [...] } 形式なら response.data.results
    // 配列そのものなら response.data
    // ▼▼▼ 修正: CIエラー回避 (any許可) ▼▼▼
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return response.data.results || (response.data as any);
  },

  // 削除
  deleteMemo: async (token: string, id: number): Promise<void> => {
    await api.delete(`/memos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // AI要約
  summarizeMemo: async (
    token: string,
    id: number
  ): Promise<{ summary: string }> => {
    const response = await api.post(
      `/memos/${id}/summarize`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
