# ---

**📝 開発手順書 (Hono (Backend) \+ React (Frontend) \+ Type Safety (RPC))**

## **1\. プロジェクト構成の概要**

このプロジェクトは、バックエンドの型定義（AppType）をフロントエンドで直接読み込む **Hono RPC** 構成を採用しています。

* **Backend**: Hono, Node.js, Prisma, PostgreSQL (pgvector), MinIO  
* **Frontend**: React, Vite, Clerk Auth  
* **通信**: Hono Client (hc) による型安全なAPIコール

## ---

**2\. 環境設定 (最重要: 型連携の確立)**

型エラーを防ぐためのキモとなる設定です。

### **2-1. パッケージバージョンの統一**

フロントエンドとバックエンドで Hono のバージョンが異なると型が壊れます。必ず合わせます。

Bash

\# 両方のディレクトリで実行  
npm install hono@latest

### **2-2. フロントエンドの設定 (frontend/)**

tsconfig.json  
バックエンドのソースコードを読み込めるようにパス解決を設定します。

JSON

{  
  "compilerOptions": {  
    "moduleResolution": "bundler",  
    "types": \["vite/client", "node"\], // Nodeの型を追加  
    "baseUrl": ".",  
    "paths": {  
      // app.ts (きれいな型定義) を明示的に指定  
      "@backend/index": \["../backend/src/app.ts"\],  
      "@backend/\*": \["../backend/src/\*"\]  
    }  
  },  
  "include": \["src/\*\*/\*", "../backend/src/\*\*/\*"\]  
}

vite.config.ts  
ブラウザでの実行時にもパスが解決されるようにします。

TypeScript

import { defineConfig } from "vite";  
import react from "@vitejs/plugin-react";  
import path from "path";

export default defineConfig({  
  plugins: \[react()\],  
  resolve: {  
    alias: {  
      "@backend": path.resolve(\_\_dirname, "../backend/src"),  
    },  
  },  
  // ...server設定  
});

## ---

**3\. バックエンドの実装 (backend/src/)**

型定義を汚染しないために、**「起動ファイル」と「ルート定義ファイル」を分ける** のが鉄則です。

### **3-1. ルート定義 (routes/memoRoutes.ts)**

export default は使わず、名前付きエクスポートを使用します。  
また、MinIOの画像をブラウザで表示するためのURL変換ロジック が重要です。

TypeScript

// 画像URL生成ロジックの要点  
const rawEndpoint \= process.env.AWS\_ENDPOINT || "";  
let publicEndpoint \= "";

// 環境変数が空、または "minio" を含む場合は localhost:9000 (ブラウザ用) に強制変換  
if (rawEndpoint.includes("minio") || \!rawEndpoint) {  
   publicEndpoint \= "http://localhost:9000";   
} else {  
   publicEndpoint \= rawEndpoint.replace("/storage/v1/s3", "/storage/v1/object/public");  
}

### **3-2. アプリ定義 (app.ts)**

ミドルウェア（CORSやLogger）を含まない、純粋なルート定義だけのファイルを作ります。**フロントエンドはこのファイルを参照します。**

TypeScript

import { Hono } from "hono";  
import { memoRouter } from "./routes/memoRoutes";

const app \= new Hono()  
  .route("/api/memos", memoRouter); // ここでパスをつなぐ

export default app;  
export type AppType \= typeof app; // 型をエクスポート

### **3-3. サーバー起動 (index.ts)**

ここでミドルウェアを適用し、サーバーを起動します。

TypeScript

import { serve } from "@hono/node-server";  
import { Hono } from "hono";  
import routeApp from "./app"; // app.ts を読み込む

const app \= new Hono();  
// app.use(cors(...)); // ミドルウェアはここに書く  
app.route("/", routeApp); // ルート定義をマウント

serve({ fetch: app.fetch, port: 8080 });

## ---

**4\. フロントエンドの実装 (frontend/src/)**

### **4-1. クライアント作成 (client.ts)**

import type で型だけを取り込みます。

TypeScript

import { hc } from 'hono/client';  
// @backend/index (= app.ts) から型を取得  
import type { AppType } from '@backend/index';

const API\_URL \= import.meta.env.VITE\_API\_BASE\_URL || 'http://localhost:8080';  
export const client \= hc\<AppType\>(API\_URL);

### **4-2. API利用 (App.tsx)**

補完が効く状態でAPIを呼び出せます。

TypeScript

// 例: データ取得  
const res \= await client.api.memos.$get(undefined, {  
  headers: { Authorization: \`Bearer ${token}\` }  
});

## ---

**5\. インフラ設定 (Docker)**

### **5-1. docker-compose.yml のポイント**

バックエンドを自動起動させる設定と、MinIOのバケット作成コマンドが重要です。

YAML

  backend:  
    \# サーバーを自動起動するコマンド (tail \-f /dev/null は使わない)  
    command: sh \-c "npm install && npm run dev"

### **5-2. MinIOの公開設定**

MinIOの画像を表示するには、バケットを public にする必要があります。  
初期化時に以下のコマンドで強制的に設定できます（最新版 mc 対応）。

Bash

docker compose run \--rm \--entrypoint sh createbuckets \-c "/usr/bin/mc alias set myminio http://minio:9000 minio\_user minio\_password && /usr/bin/mc anonymous set public myminio/memo-bucket"

## ---

**6\. トラブルシューティング集**

今回の開発で発生した主なエラーとその対処法です。

| エラー現象 | 原因 | 対処法 |
| :---- | :---- | :---- |
| **EADDRINUSE: :::8080** | 以前のサーバーがゾンビ化してポートを占有している。 | ターミナルで npx kill-port 8080 を実行するか、Dockerを再起動する。 |
| **ClientRequest 型エラー** | フロントエンドが古い型を見ているか、Honoのバージョン不一致。 | 1\. npm install hono@latest (両方) 2\. VS Codeで F1 → Restart TS Server |
| **ERR\_CONNECTION\_RESET** | バックエンドサーバーが落ちている。 | バックエンドのログ (docker compose logs \-f backend) を確認し、エラーを修正して自動再起動を待つ。 |
| **Region is missing** | AWS SDKの設定不足。 | storageService.ts で \`region: process.env.AWS\_REGION |
| **画像が割れる / リンク切れ** | URLが minio:9000 (内部DNS) になっている。 | memoRoutes.ts で localhost:9000 に置換するロジックを入れる。 |
| **画像リクエストが text/html** | 画像URLが不正（undefined等）で、Viteがindex.htmlを返している。 | 上記のURL生成ロジックを見直し、環境変数がない場合のフォールバックを入れる。 |

---

これで今回のフェーズは完了です。お疲れ様でした！