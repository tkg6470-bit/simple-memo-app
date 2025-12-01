import { useState, useEffect } from "react";
import axios from "axios";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/clerk-react";

type Memo = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

function App() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [summaries, setSummaries] = useState<{ [key: number]: string }>({});
  const [loadingMap, setLoadingMap] = useState<{ [key: number]: boolean }>({});

  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMemos();
    }
  }, [user]);

  const getAuthHeaders = async () => {
    const token = await getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchMemos = async () => {
    try {
      const config = await getAuthHeaders();
      const response = await axios.get("http://localhost:8080/memos", config);
      setMemos(response.data);
    } catch (error) {
      console.error("Error fetching memos:", error);
      // エラーを見える化
      // alert("メモの取得に失敗しました。バックエンドが起動していない可能性があります。");
    }
  };

  const createMemo = async () => {
    if (!title || !content) {
      alert("タイトルと内容を入力してください");
      return;
    }
    try {
      const config = await getAuthHeaders();
      await axios.post(
        "http://localhost:8080/memos",
        { title, content },
        config
      );
      setTitle("");
      setContent("");
      fetchMemos();
    } catch (error: any) {
      console.error("Error creating memo:", error);
      // ↓↓↓ ここでエラー内容を表示！ ↓↓↓
      const msg = error.response?.data?.error || error.message;
      alert(
        `保存に失敗しました: ${msg}\n(バックエンドのログを確認してください)`
      );
    }
  };

  const deleteMemo = async (id: number) => {
    if (!window.confirm("本当に削除しますか？")) return;
    try {
      const config = await getAuthHeaders();
      await axios.delete(`http://localhost:8080/memos/${id}`, config);
      fetchMemos();
    } catch (error) {
      console.error("Error deleting memo:", error);
      alert("削除に失敗しました。");
    }
  };

  const summarizeMemo = async (id: number) => {
    if (loadingMap[id]) return;
    setLoadingMap((prev) => ({ ...prev, [id]: true }));

    try {
      const config = await getAuthHeaders();
      const response = await axios.post(
        `http://localhost:8080/memos/${id}/summarize`,
        {},
        config
      );
      setSummaries((prev) => ({ ...prev, [id]: response.data.summary }));
    } catch (error: any) {
      console.error("AI Error:", error);
      const msg = error.response?.data?.error || "不明なエラー";
      alert(`AI要約に失敗しました: ${msg}`);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>
          📝 Memo App{" "}
          <span style={{ fontSize: "0.6em", color: "#666" }}>(AI Powered)</span>
        </h1>

        <SignedIn>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>{user?.fullName || user?.firstName}</span>
            <UserButton />
          </div>
        </SignedIn>

        <SignedOut>
          <SignInButton mode="modal">
            <button
              style={{
                padding: "10px 20px",
                cursor: "pointer",
                backgroundColor: "#333",
                color: "white",
                border: "none",
                borderRadius: "4px",
              }}
            >
              サインイン
            </button>
          </SignInButton>
        </SignedOut>
      </header>

      <SignedIn>
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h2 style={{ marginTop: 0 }}>新しいメモ</h2>
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <textarea
            placeholder="内容 (長文を入力してAI要約を試してみてください)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              height: "120px",
              marginBottom: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={createMemo}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
            }}
          >
            保存する
          </button>
        </div>

        <h2>メモ一覧</h2>
        {memos.length === 0 && (
          <p style={{ color: "#888" }}>メモはまだありません。</p>
        )}

        {memos.map((memo) => (
          <div
            key={memo.id}
            style={{
              border: "1px solid #eee",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
                {memo.title}
              </h3>
              <div style={{ fontSize: "12px", color: "#999" }}>
                {new Date(memo.created_at).toLocaleDateString()}{" "}
                {new Date(memo.created_at).toLocaleTimeString()}
              </div>
            </div>

            <p
              style={{
                margin: "0 0 15px 0",
                whiteSpace: "pre-wrap",
                lineHeight: "1.6",
                color: "#555",
              }}
            >
              {memo.content}
            </p>

            {summaries[memo.id] && (
              <div
                style={{
                  backgroundColor: "#e6f7ff",
                  padding: "15px",
                  borderRadius: "6px",
                  marginBottom: "15px",
                  border: "1px solid #91d5ff",
                }}
              >
                <strong style={{ color: "#0050b3" }}>🤖 AI要約:</strong>
                <p style={{ margin: "5px 0 0 0", fontSize: "0.95em" }}>
                  {summaries[memo.id]}
                </p>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => summarizeMemo(memo.id)}
                disabled={loadingMap[memo.id]}
                style={{
                  padding: "5px 15px",
                  cursor: loadingMap[memo.id] ? "wait" : "pointer",
                  backgroundColor: loadingMap[memo.id] ? "#ccc" : "#52c41a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {loadingMap[memo.id] ? "思考中..." : "✨ AI要約"}
              </button>

              <button
                onClick={() => deleteMemo(memo.id)}
                style={{
                  padding: "5px 15px",
                  cursor: "pointer",
                  backgroundColor: "#ff4d4f",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                }}
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </SignedIn>
    </div>
  );
}

export default App;
