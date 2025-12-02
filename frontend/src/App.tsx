import { useState, useEffect, useRef } from "react";
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
  imageUrl?: string; // 画像URLを追加 (無い場合もあるので ?)
  created_at: string;
  updated_at: string;
};

function App() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // ↓↓↓ 画像ファイル用のStateを追加 ↓↓↓
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [summaries, setSummaries] = useState<{ [key: number]: string }>({});
  const [loadingMap, setLoadingMap] = useState<{ [key: number]: boolean }>({});

  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (user) fetchMemos();
  }, [user]);

  const getAuthHeaders = async () => {
    const token = await getToken();
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        // ※FormDataを送る時は 'Content-Type': 'application/json' を書いてはいけません
        // axiosが自動で設定してくれるので、AuthorizationだけでOKです
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
    }
  };

  // ↓↓↓ 修正: 画像送信に対応 ↓↓↓
  const createMemo = async () => {
    if (!title || !content) {
      alert("タイトルと内容を入力してください");
      return;
    }

    try {
      const config = await getAuthHeaders();

      // JSONではなく「FormData」という形式を使います
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) {
        formData.append("image", image); // 画像があれば追加
      }

      await axios.post("http://localhost:8080/memos", formData, config);

      // フォームをリセット
      setTitle("");
      setContent("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // ファイル選択もクリア

      fetchMemos();
    } catch (error: any) {
      console.error("Error creating memo:", error);
      const msg = error.response?.data?.error || error.message;
      alert(`保存に失敗しました: ${msg}`);
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
      alert("AI要約に失敗しました。");
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
          <span style={{ fontSize: "0.6em", color: "#666" }}>(AI & Image)</span>
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
            placeholder="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              height: "100px",
              marginBottom: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />

          {/* ↓↓↓ 画像選択ボタン ↓↓↓ */}
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
                fontSize: "0.9em",
              }}
            >
              画像添付 (任意):
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) =>
                setImage(e.target.files ? e.target.files[0] : null)
              }
            />
          </div>

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
            <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>
              {memo.title}
            </h3>

            {/* ↓↓↓ 画像があれば表示する ↓↓↓ */}
            {memo.imageUrl && (
              <div style={{ marginBottom: "15px" }}>
                <img
                  src={memo.imageUrl}
                  alt="uploaded"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "300px",
                    borderRadius: "4px",
                    border: "1px solid #eee",
                  }}
                />
              </div>
            )}

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
                  cursor: "pointer",
                  backgroundColor: loadingMap[memo.id] ? "#ccc" : "#52c41a",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
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
