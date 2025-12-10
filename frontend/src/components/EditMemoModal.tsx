import { useState, useEffect } from "react";

// ※ App.tsx と型を合わせるための定義
interface Memo {
  id: string | number; // IDが数値か文字列か両方対応できるように
  title: string;
  content: string;
  imageUrl?: string | null;
  createdAt?: string;
}

interface EditMemoModalProps {
  memo: Memo;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, formData: FormData) => Promise<void>;
}

export default function EditMemoModal({
  memo,
  isOpen,
  onClose,
  onUpdate,
}: EditMemoModalProps) {
  const [title, setTitle] = useState(memo.title);
  const [content, setContent] = useState(memo.content);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(memo.title);
      setContent(memo.content);
      setImageFile(null);
    }
  }, [isOpen, memo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await onUpdate(String(memo.id), formData);
      onClose();
    } catch (error) {
      console.error("Failed to update memo:", error);
      alert("更新に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // オーバーレイ (背景の黒い部分)
    <div
      style={{
        position: "fixed",
        inset: 0,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000, // 最前面に表示
      }}
      onClick={onClose} // 背景クリックで閉じる
    >
      {/* モーダル本体 */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "24px",
          width: "90%",
          maxWidth: "500px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
        onClick={(e) => e.stopPropagation()} // 中身クリックでは閉じないように
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            marginBottom: "16px",
            margin: 0,
          }}
        >
          メモを編集
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              タイトル
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box", // 枠からはみ出ないように
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              本文
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "4px",
              }}
            >
              画像 (変更する場合のみ)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageFile(e.target.files[0]);
                }
              }}
              style={{ fontSize: "0.875rem", color: "#6b7280" }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              paddingTop: "8px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "#374151",
                backgroundColor: "#f3f4f6",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "8px 16px",
                fontSize: "0.875rem",
                fontWeight: "500",
                color: "white",
                backgroundColor: "#2563eb", // 青色
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "保存中..." : "保存する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
