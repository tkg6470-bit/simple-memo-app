// import OpenAI from 'openai'; // OpenAIは使わないのでコメントアウト

// 環境変数も使いませんが、エラーにならないようコメントアウトのままでOK
/*
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
*/

export const summarizeText = async (text: string): Promise<string> => {
  // 1. AIが考えているフリをする（1秒待つ）
  // これがないと一瞬で終わってしまい、味気ないので演出として入れます
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 2. ダミーの要約テキストを作成
  const mockSummary = `【AI要約(モック)】
これは開発用のダミー要約です。
OpenAI APIの課金なしで動作確認ができます。
-------------------
元の文章の冒頭: ${text.substring(0, 30)}...`;

  return mockSummary;
};
