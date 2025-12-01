import { useState, useEffect } from "react";
import axios from "axios";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";

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
  const { user } = useUser();

  useEffect(() => {
    // ログイン済みならメモを取得
    if (user) {
      fetchMemos();
    }
  }, [user]);

  const fetchMemos = async () => {
    try {
      const response = await axios.get("http://localhost:8080/memos");
      setMemos(response.data);
    } catch (error) {
      console.error("Error fetching memos:", error);
    }
  };

  const createMemo = async () => {
    if (!title || !content) return;
    try {
      await axios.post("http://localhost:8080/memos", { title, content });
      setTitle("");
      setContent("");
      fetchMemos();
    } catch (error) {
      console.error("Error creating memo:", error);
    }
  };

  const deleteMemo = async (id: number) => {
    try {
      await axios.delete(`http://localhost:8080/memos/${id}`);
      fetchMemos();
    } catch (error) {
      console.error("Error deleting memo:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>📝 Memo App</h1>
        
        {/* ログイン済みならユーザーアイコンを表示 */}
        <SignedIn>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>{user?.fullName || user?.firstName}</span>
            <UserButton />
          </div>
        </SignedIn>

        {/* 未ログインならサインインボタンを表示 */}
        <SignedOut>
          <SignInButton mode="modal">
            <button style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "#333", color: "white", border: "none", borderRadius: "4px" }}>
              サインイン
            </button>
          </SignInButton>
        </SignedOut>
      </header>

      {/* ログイン済みの場合のみ、メモアプリ機能を表示 */}
      <SignedIn>
        <div style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
          <h2>新しいメモ</h2>
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
          />
          <textarea
            placeholder="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ width: "100%", padding: "8px", height: "100px", marginBottom: "10px", boxSizing: "border-box" }}
          />
          <button onClick={createMemo} style={{ padding: "10px 20px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
            保存する
          </button>
        </div>

        <h2>メモ一覧</h2>
        {memos.map((memo) => (
          <div key={memo.id} style={{ border: "1px solid #eee", padding: "15px", marginBottom: "10px", borderRadius: "5px" }}>
            <h3 style={{ margin: "0 0 10px 0" }}>{memo.title}</h3>
            <p style={{ margin: "0 0 10px 0", whiteSpace: "pre-wrap" }}>{memo.content}</p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#666" }}>
              <span>{new Date(memo.created_at).toLocaleString()}</span>
              <button onClick={() => deleteMemo(memo.id)} style={{ color: "red", cursor: "pointer", border: "none", background: "none" }}>削除</button>
            </div>
          </div>
        ))}
      </SignedIn>

      {/* 未ログイン時のメッセージ */}
      <SignedOut>
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p>メモ機能を使うにはサインインしてください。</p>
        </div>
      </SignedOut>
    </div>
  );
}

export default App;