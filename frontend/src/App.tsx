import { useState, useEffect, useRef } from "react";
import { memoApi } from "./api/memoApi";
import { Memo } from "./types/memo";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/clerk-react";

// ▼▼▼ 修正: 検索バーコンポーネント (インラインスタイルでサイズ固定) ▼▼▼
const SearchBar = ({
  onSearch,
  isLoading,
}: {
  onSearch: (q: string) => void;
  isLoading: boolean;
}) => {
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(q);
      }}
      style={{
        marginBottom: "20px",
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* アイコン: スタイルで幅・高さを20pxに強制指定 */}
      <div
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <svg
          style={{ width: "20px", height: "20px", color: "#888" }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>

      {/* 入力欄: 左側にアイコン分の余白(padding-left)を設ける */}
      <input
        type="text"
        placeholder="AI検索: 「旅行の計画」など意味で検索..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 12px 12px 40px", // 左パディングを40pxにしてアイコンと重ならないように
          borderRadius: "8px",
          border: "1px solid #ccc",
          fontSize: "16px",
          outline: "none",
        }}
      />

      <button
        type="submit"
        disabled={isLoading}
        style={{
          marginLeft: "10px",
          padding: "10px 20px",
          background: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          whiteSpace: "nowrap",
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? "検索中..." : "検索"}
      </button>
    </form>
  );
};

function App() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [summaries, setSummaries] = useState<{ [key: number]: string }>({});
  const [loadingMap, setLoadingMap] = useState<{ [key: number]: boolean }>({});

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (user) loadMemos();
  }, [user]);

  const getTokenStr = async () => {
    return (await getToken()) || "";
  };

  const loadMemos = async () => {
    try {
      const token = await getTokenStr();
      const data = await memoApi.getAllMemos(token);
      setMemos(data);
    } catch (error) {
      console.error("Failed to load memos", error);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      loadMemos();
      return;
    }

    setIsSearching(true);
    try {
      const token = await getTokenStr();
      const results = await memoApi.searchMemos(token, query);
      setMemos(results);
    } catch (error) {
      console.error("Search failed", error);
      alert("検索に失敗しました");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreate = async () => {
    if (!title || !content) {
      alert("タイトルと内容を入力してください");
      return;
    }
    try {
      const token = await getTokenStr();
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      await memoApi.createMemo(token, formData);

      setTitle("");
      setContent("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      setSearchQuery("");
      loadMemos();
    } catch (error: any) {
      alert("保存に失敗しました");
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("削除しますか？")) return;
    try {
      const token = await getTokenStr();
      await memoApi.deleteMemo(token, id);
      setMemos((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      alert("削除に失敗しました");
    }
  };

  const handleSummarize = async (id: number) => {
    setLoadingMap((prev) => ({ ...prev, [id]: true }));
    try {
      const token = await getTokenStr();
      const res = await memoApi.summarizeMemo(token, id);
      setSummaries((prev) => ({ ...prev, [id]: res.summary }));
    } catch (error) {
      alert("要約に失敗しました");
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
          marginBottom: "20px",
        }}
      >
        <h1>📝 AI Memo App</h1>
        <SignedIn>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span>{user?.fullName}</span>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              style={{
                padding: "10px",
                background: "#333",
                color: "white",
                borderRadius: "4px",
                border: "none",
                cursor: "pointer",
              }}
            >
              サインイン
            </button>
          </SignInButton>
        </SignedOut>
      </header>

      <SignedIn>
        <SearchBar onSearch={handleSearch} isLoading={isSearching} />

        {searchQuery && (
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              「{searchQuery}」の検索結果: {memos.length}件
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                loadMemos();
              }}
              style={{
                color: "blue",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
            >
              クリアして全件表示
            </button>
          </div>
        )}

        <div
          style={{
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            background: "#f9f9f9",
            marginBottom: "30px",
          }}
        >
          <h2>新規メモ</h2>
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
              height: "80px",
              marginBottom: "10px",
              boxSizing: "border-box",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <div style={{ marginBottom: "10px" }}>
            <label>画像: </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </div>
          <button
            onClick={handleCreate}
            style={{
              padding: "10px 20px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            保存する
          </button>
        </div>

        {memos.map((memo) => (
          <div
            key={memo.id}
            style={{
              border: "1px solid #eee",
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              background: "white",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: "0 0 10px 0" }}>{memo.title}</h3>
              {memo.similarity !== undefined && (
                <span
                  style={{
                    background: "#d4edda",
                    color: "#155724",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "0.8em",
                  }}
                >
                  AI一致度: {(memo.similarity * 100).toFixed(1)}%
                </span>
              )}
            </div>

            {memo.imageUrl && (
              <img
                src={memo.imageUrl}
                alt="uploaded"
                style={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  marginBottom: "10px",
                }}
              />
            )}
            <p style={{ whiteSpace: "pre-wrap", color: "#555" }}>
              {memo.content}
            </p>

            {summaries[memo.id] && (
              <div
                style={{
                  background: "#e6f7ff",
                  padding: "10px",
                  borderRadius: "4px",
                  marginBottom: "10px",
                  color: "#0050b3",
                }}
              >
                <strong>🤖 AI要約:</strong> {summaries[memo.id]}
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
                onClick={() => handleSummarize(memo.id)}
                disabled={loadingMap[memo.id]}
                style={{
                  padding: "5px 10px",
                  background: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                {loadingMap[memo.id] ? "思考中..." : "AI要約"}
              </button>
              <button
                onClick={() => handleDelete(memo.id)}
                style={{
                  padding: "5px 10px",
                  background: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
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
