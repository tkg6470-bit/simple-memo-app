import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react"; // Clerk認証用
import { client } from "../client"; // 作成したHonoクライアント

export const MemoListCheck = () => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [memos, setMemos] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("準備中...");

  useEffect(() => {
    // ログインしていない、またはロード中は実行しない
    if (!isLoaded || !isSignedIn) {
      setStatus("ログインしてください");
      return;
    }

    const fetchData = async () => {
      setStatus("データ取得中...");

      try {
        // 1. Clerkから認証トークンを取得 (Bearerトークン)
        const token = await getToken();

        // 2. Hono RPCを使ってリクエスト
        // client.api.memos.$get はバックエンドのルート構造に合わせて補完されます
        const res = await client.api.memos.$get(
          undefined, // クエリパラメータがない場合は undefined
          {
            headers: {
              Authorization: `Bearer ${token}`, // ヘッダーにトークンをセット
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setMemos(data);
          setStatus("取得成功！Connection OK ✅");
        } else {
          setStatus(`エラー発生: ステータスコード ${res.status}`);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setStatus("通信エラーが発生しました");
      }
    };

    fetchData();
  }, [getToken, isSignedIn, isLoaded]);

  return (
    <div style={{ padding: "20px", border: "2px solid #4CAF50", borderRadius: "8px", margin: "20px" }}>
      <h2>📡 バックエンド接続テスト</h2>
      <p>
        状態: <strong>{status}</strong>
      </p>

      {memos.length === 0 ? (
        <p>メモデータはありません（または取得前）</p>
      ) : (
        <ul>
          {memos.map((memo) => (
            <li key={memo.id}>
              <strong>{memo.title}</strong>
              <br />
              <small style={{ color: "#666" }}>ID: {memo.id}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};