import { hc } from 'hono/client';
// 👇 修正箇所: { ... } を { AppType } に変更し、type を明記します
import type { AppType } from '@backend/index';

// 環境変数 または ローカルホスト
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const client = hc<AppType>(API_URL);