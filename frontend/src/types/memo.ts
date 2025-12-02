export interface Memo {
  id: number;
  userId: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  // ベクトル検索の結果に含まれる類似度スコア (0.0 ~ 1.0)
  similarity?: number;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  results: Memo[];
}
