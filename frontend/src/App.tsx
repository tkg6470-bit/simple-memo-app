import { useState, useEffect } from "react";
import axios from "axios";

// メモの型定義
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

  // 画面が表示された時にメモ一覧を取得
  useEffect(() => {
    fetchMemos();
  }, []);

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
      await axios.post("http://localhost:8080/memos", {
        title,
        content,
      });
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
      <h1>📝 Memo App</h1>

      {/* 投稿フォーム */}
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

      {/* メモ一覧 */}
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
    </div>
  );
}

export default App;