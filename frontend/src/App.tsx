import React, { useState, useEffect } from "react";
import axios from "axios";
import { Memo } from "./types";

const App: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ★ 編集用のState追加
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

  useEffect(() => {
    fetchMemos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMemos = async () => {
    try {
      const response = await axios.get(`${API_URL}/memos`);
      setMemos(response.data);
    } catch (error) {
      console.error("メモの取得エラー:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await axios.post(`${API_URL}/memos`, { title, content });
      setTitle("");
      setContent("");
      fetchMemos();
    } catch (error) {
      console.error("作成エラー:", error);
      alert("作成に失敗しました");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/memos/${id}`);
      fetchMemos();
    } catch (error) {
      console.error("削除エラー:", error);
    }
  };

  // ★ 編集モードを開始する
  const startEditing = (memo: Memo) => {
    setEditingId(memo.id);
    setEditTitle(memo.title);
    setEditContent(memo.content);
  };

  // ★ 編集をキャンセルする
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
    setEditContent("");
  };

  // ★ 編集内容を保存する (UPDATE)
  const handleUpdate = async (id: number) => {
    try {
      await axios.put(`${API_URL}/memos/${id}`, {
        title: editTitle,
        content: editContent,
      });
      setEditingId(null); // 編集モード終了
      fetchMemos(); // リスト更新
    } catch (error) {
      console.error("更新エラー:", error);
      alert("更新に失敗しました");
    }
  };

  const isFormValid = title !== "" && content !== "";

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>
        📝 シンプルメモアプリ
      </h1>

      {/* 新規作成フォーム */}
      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>新しいメモを追加</h2>
        <form onSubmit={handleSubmit}>
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
              height: "80px",
              padding: "10px",
              marginBottom: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
              resize: "vertical",
            }}
          />
          <button
            type="submit"
            disabled={!isFormValid}
            style={{
              padding: "10px 20px",
              backgroundColor: isFormValid ? "#007bff" : "#cccccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isFormValid ? "pointer" : "not-allowed",
              fontWeight: "bold",
            }}
          >
            追加する
          </button>
        </form>
      </div>

      {/* メモ一覧表示 */}
      <div>
        <h2 style={{ borderBottom: "2px solid #eee", paddingBottom: "10px" }}>
          メモ一覧
        </h2>
        {memos.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            メモはまだありません。
          </p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {memos.map((memo) => (
              <div
                key={memo.id}
                style={{
                  padding: "15px",
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                }}
              >
                {/* ★ 編集モードかどうかで表示を切り替える */}
                {editingId === memo.id ? (
                  // ■ 編集モードの表示
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginBottom: "8px",
                        boxSizing: "border-box",
                        fontSize: "1.1rem",
                      }}
                    />
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{
                        width: "100%",
                        height: "100px",
                        padding: "8px",
                        marginBottom: "8px",
                        boxSizing: "border-box",
                        resize: "vertical",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <button
                        onClick={cancelEditing}
                        style={{
                          padding: "5px 10px",
                          cursor: "pointer",
                          backgroundColor: "#ccc",
                          border: "none",
                          borderRadius: "4px",
                        }}
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={() => handleUpdate(memo.id)}
                        style={{
                          padding: "5px 15px",
                          cursor: "pointer",
                          backgroundColor: "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                        }}
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  // ■ 通常モードの表示
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.1rem",
                          color: "#2c3e50",
                        }}
                      >
                        {memo.title}
                      </h3>
                      <div style={{ display: "flex", gap: "8px" }}>
                        {/* 編集ボタンを追加 */}
                        <button
                          onClick={() => startEditing(memo)}
                          style={{
                            backgroundColor: "#ffc107",
                            color: "#333",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(memo.id)}
                          style={{
                            backgroundColor: "#ff4d4d",
                            color: "white",
                            border: "none",
                            padding: "5px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                          }}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                    <p
                      style={{
                        whiteSpace: "pre-wrap",
                        margin: "0 0 10px 0",
                        color: "#555",
                        lineHeight: "1.5",
                      }}
                    >
                      {memo.content}
                    </p>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: "#999",
                        textAlign: "right",
                      }}
                    >
                      更新日: {new Date(memo.updated_at).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
