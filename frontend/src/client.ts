import { hc } from "hono/client";
// 👇 修正箇所: type を明記
import type { AppType } from "@backend/index";

// 1. 環境変数を取得 (Renderでよく使われる VITE_API_URL も確認するように追加)
const rawUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080";

// 2. 【重要】URLの末尾にある "/api" や "/" を削除して正規化します
// これにより ".../api/api/memos" という重複事故を防ぎます
const API_URL = rawUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");

export const client = hc<AppType>(API_URL);
