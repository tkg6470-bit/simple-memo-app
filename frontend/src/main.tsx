import React from "react";
import ReactDOM from "react-dom/client";
// 修正1: 拡張子 .tsx を削除 (TS5097エラー回避)
import App from "./App";
import { ClerkProvider } from "@clerk/clerk-react";
// --- 👇 Sentry 追加 ---
import * as Sentry from "@sentry/react";

// 修正2: 型エラー回避のため any キャストを使用 (TS2339エラー回避)
// ▼▼▼ 修正: CIエラー回避 (any許可) ▼▼▼
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const env = (import.meta as any).env;
const PUBLISHABLE_KEY = env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}
// --- 👇 Sentry 初期化処理を追加 ---
Sentry.init({
  dsn: env.VITE_SENTRY_DSN, // .env から読み込み
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, // 必要に応じて調整 (0.0〜1.0)
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
// --------------------

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
