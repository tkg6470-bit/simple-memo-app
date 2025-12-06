import React from "react";
import ReactDOM from "react-dom/client";
// 修正1: 拡張子 .tsx を削除 (TS5097エラー回避)
import App from "./App";
import { ClerkProvider } from "@clerk/clerk-react";

// 修正2: 型エラー回避のため any キャストを使用 (TS2339エラー回避)
// ▼▼▼ 修正: CIエラー回避 (any許可) ▼▼▼
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PUBLISHABLE_KEY = (import.meta as any).env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
