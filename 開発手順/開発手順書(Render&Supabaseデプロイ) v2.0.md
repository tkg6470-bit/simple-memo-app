# ---

**📘 開発手順書(Render\&Supabaseデプロイ) v2.0**

Project: Simple Memo App (Ultimate Edition)  
Last Updated: 2025-12-06  
Version: 2.0 (Production Release)  
Status: Deployed & Operational  
本ドキュメントは、ローカル開発環境（Dev Containers）で構築されたフルスタックアプリケーションを、Render (Backend/Frontend) および Supabase (DB/Storage) へデプロイし、完全なWebアプリケーションとして公開・運用するための全手順と技術的解決策の記録である。

## ---

**1\. システム構成とデプロイ戦略**

コスト最適化と安定稼働のため、以下の構成を採用している。

* **Frontend:** Render (Static Site) \- React/Vite  
* **Backend:** Render (Web Service) \- Node.js/Hono (Docker)  
* **Database:** Supabase (PostgreSQL \+ pgvector)  
* **Storage:** Supabase Storage (S3 Compatible)  
* **Auth:** Clerk

### **⚠️ 重要: ビルド戦略 (Local Build Strategy)**

Renderの無料プランにおけるリソース制限（メモリ不足によるビルド強制終了）を回避するため、バックエンドは\*\*「ローカルでビルドし、成果物 (dist) をGitにプッシュする」\*\*方式を正式なデプロイフローとする。

Bash

\# バックエンドのデプロイ手順（定型）  
cd backend  
npm run build             \# ローカルでTypeScriptをJSに変換  
git add \-f dist           \# .gitignoreされているdistを強制的に追加  
git commit \-m "Deploy: update build artifacts"  
git push origin main      \# 本番ブランチへプッシュ

## ---

**2\. Backend 構築設定 (Render Web Service)**

### **2.1 環境変数 (Environment Variables)**

Render Dashboardにて以下を設定し、外部サービスとの接続を確立する。

| 変数名 | 設定値 / 形式 | 役割 |
| :---- | :---- | :---- |
| AWS\_ACCESS\_KEY\_ID | (Supabase S3 Key) | ストレージ接続用ID |
| AWS\_SECRET\_ACCESS\_KEY | (Supabase S3 Secret) | ストレージ接続用秘密鍵 |
| AWS\_ENDPOINT | https://\[ProjectID\].supabase.co/storage/v1/s3 | S3互換エンドポイント (dummy不可) |
| AWS\_BUCKET\_NAME | images | 保存先バケット名 |
| AWS\_REGION | ap-northeast-2 | リージョン |
| DATABASE\_URL | (Supabase Connection String) | DB接続文字列 (Transaction Mode推奨) |
| OPENAI\_API\_KEY | sk-... | AI機能用 (テスト時はMock動作可) |
| NODE\_VERSION | 20 | ランタイムバージョン固定 |
| NPM\_CONFIG\_PRODUCTION | false | ビルドに必要なdevDependenciesをインストールさせるため |

### **2.2 Dockerfile 設定 (Optimization)**

メモリ消費を抑え、Prismaを正常動作させるための最適化設定。

* **Base Image:** node:20-slim (軽量化)  
* **Dependencies:** openssl のインストール必須 (Prisma用)  
* **Command:** CMD \["node", "dist/index.js"\] ( tsx ではなく、コンパイル済みファイルを実行)

## ---

**3\. Frontend 構築設定 (Render Static Site)**

### **3.1 基本設定**

* **Build Command:** npm install && npm run build  
* **Publish Directory:** dist  
* **Root Directory:** frontend

### **3.2 環境変数 (Environment Variables)**

| 変数名 | 設定値 | 備考 |
| :---- | :---- | :---- |
| VITE\_API\_BASE\_URL | https://\[Backend\].onrender.com/api | **末尾に /memos をつけないこと** (404の原因になる) |
| VITE\_CLERK\_PUBLISHABLE\_KEY | pk\_test\_... | **必須設定**。これがないと画面が白くなり動作しない。 |

### **3.3 リライト設定 (SPA対策)**

React RouterなどのSPAが、リロード時に404エラーにならないための必須設定。

* **Settings** \> **Redirects/Rewrites**  
* **Source:** /\*  
* **Destination:** /index.html  
* **Action:** Rewrite

## ---

**4\. コードベース修正ログ (Critical Fixes)**

本番環境特有のエラーや要件を満たすために実施した重要なコード修正。

### **🛠️ 4.1 認証とセキュリティ (Clerk & CORS)**

* **本番CORS対応 (index.ts):**  
  * ローカル開発時のポート変動 (5173→5174) や、本番フロントエンドからのアクセスを動的に許可。

TypeScript  
origin: (origin) \=\> {  
  if (origin \=== "https://simple-memo-frontend.onrender.com") return origin; // 本番  
  if (origin && origin.startsWith("http://localhost:")) return origin; // ローカル全ポート  
  return origin;  
}

* **本番認証の実装 (memoController.ts):**  
  * テスト用の test\_user\_123 を廃止し、@hono/clerk-auth を導入して実際のClerkユーザーIDを取得するように変更。これにより「自分だけのメモ」を実現。

### **🛠️ 4.2 画像アップロード機能 (memoController.ts)**

* **ダックタイピング (Duck Typing) の導入:**  
  * **課題:** Node.js環境において、instanceof File が正しく判定されずアップロードがスキップされる。  
  * **対応:** 型チェックではなく「arrayBuffer 関数を持っているか」でファイル判定を行うロジックに変更。  
* **S3ファイル名のサニタイズ:**  
  * **課題:** 日本語やスペースを含むファイル名をSupabaseに送ると InvalidKey エラーになる。  
  * **対応:** ファイル名を破棄し、Timestamp \+ Random \+ 拡張子 の安全な英数字名に変換して保存。

### **🛠️ 4.3 AI Mockモードの実装**

* **コスト対策:** OpenAI APIの課金を防ぎつつ動作確認を行うため、summarizeMemo 関数内でAPIを呼ばずにダミーテキストを返す処理を実装。

## ---

**5\. 運用フロー (Git Workflow)**

開発フェーズ終了に伴い、メインブランチでの運用体制へ移行。

1. **ブランチ構成:**  
   * main: 本番用ブランチ。Renderはこのブランチを常時監視し、プッシュされると自動デプロイする。  
   * feature/\*: 新機能開発用。  
2. **デプロイ手順:**  
   * 新機能開発完了後、main にマージし、前述の「ローカルビルド手順」を実行してプッシュする。

## ---

**6\. トラブルシューティング事例集**

開発中に遭遇したエラーとその解決策のまとめ。

| 現象 | 原因 | 解決策 |
| :---- | :---- | :---- |
| **画面が真っ白になる** | フロントエンド環境変数に Clerk の Key が未設定。 | Render Environment に VITE\_CLERK\_PUBLISHABLE\_KEY を追加して再デプロイ。 |
| **API 404 Not Found** | Base URL の末尾に /memos が重複していた。 | VITE\_API\_BASE\_URL を .../api (末尾なし) に修正。 |
| **画像保存失敗 (ログなし)** | instanceof File が false になり処理スキップ。 | ダックタイピング (arrayBuffer in image) に変更。 |
| **画像保存エラー (InvalidKey)** | 日本語ファイル名が S3 プロトコルで拒否された。 | コントローラーでランダム英数字名に変換処理を追加。 |
| **CORS Error (Local)** | Vite ポートが 5174 に変わったが許可外だった。 | index.ts で startsWith("http://localhost:") を許可。 |
| **Gitコマンドエラー** | Dockerコンテナ内 (/app) でGitを実行しようとした。 | ホストマシンのターミナルからGitコマンドを実行する。 |

---

**End of Document**