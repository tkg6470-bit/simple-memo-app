// OpenAI APIのインポートを完全に削除 (費用を抑えるため)
// import OpenAI from "openai";

// 1536次元のダミーベクトルを生成するためのヘルパー関数
const generateDummyVector = (): number[] => {
  const DUMMY_DIMENSION = 1536;
  const vector = new Array(DUMMY_DIMENSION).fill(0);

  // ダミーでも計算できるように、一部にランダムな値を入れておく
  for (let i = 0; i < 5; i++) {
    vector[i] = Math.random() * 0.1;
  }
  return vector;
};

// exportを付けて、外部からインポートできるようにします。
export const aiService = {
  /**
   * 【モック実装】テキストをベクトル化する代わりに、1536次元のダミーベクトルを返します。
   * これにより、OpenAIキーなしでDBのpgvector演算をテストできます。
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // 1. AIが考えているフリをする（少し待つ）
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 2. ダミーの1536次元ベクトルを返却
    return generateDummyVector();
  },

  /**
   * F-07: AI 自動要約機能のスタブ。
   */
  async summarize(content: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `【AI要約(モック・課金なし)】: ${content.substring(0, 30)}...`;
  },
};
