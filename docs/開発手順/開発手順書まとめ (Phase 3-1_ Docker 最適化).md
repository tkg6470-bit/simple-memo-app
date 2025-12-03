

### **📋 開発手順書まとめ (Phase 3-1: Docker 最適化)**

今回の作業では、開発環境とは別に、本番環境で運用するための\*\*「軽量でセキュアなコンテナイメージ」\*\*を作成する基盤を構築しました。

#### **1\. 本番用 Dockerfile の作成 (Multi-stage Build)**

* **backend/Dockerfile.prod**  
  * **Builder ステージ:**  
    * npm ci で開発用も含めた全依存パッケージをインストール。  
    * npx prisma generate で Prisma Client を生成。  
    * npm run build (tsc) で TypeScript を JavaScript にコンパイル (dist フォルダ生成)。  
  * **Runner ステージ:**  
    * 軽量な node:20-slim をベースに使用。  
    * NODE\_ENV=production を設定。  
    * npm ci \--only=production で本番用依存パッケージのみをインストール（サイズ削減）。  
    * builder ステージから dist, package.json, prisma フォルダのみをコピー。  
    * 非ルートユーザー (USER node) で実行し、セキュリティを向上。  
    * 起動コマンド: node dist/index.js。  
* **frontend/Dockerfile.prod**  
  * **Builder ステージ:**  
    * ARG でビルド時に環境変数（API URL, Clerk キー）を受け取る設定を追加。  
    * npm run build (vite build) で静的ファイルを生成 (dist フォルダ)。  
  * **Runner ステージ:**  
    * 軽量 Web サーバー serve をグローバルインストール。  
    * builder ステージから dist フォルダのみをコピー。  
    * 起動コマンド: serve \-s dist \-l 3000。

#### **2\. コード品質の向上 (Strict Build Error Fixes)**

本番ビルド (tsc) の厳密なチェックにより発覚した、潜在的なバグや型エラーを修正しました。

* **バックエンド (backend/src/services/memoService.ts)**  
  * **型エラー修正:** Prisma の orderBy 指定で、スネークケース created\_at をキャメルケース createdAt に修正。  
* **フロントエンド (frontend/src/main.tsx)**  
  * **インポートパス修正:** .tsx 拡張子を削除（ビルドツールの仕様準拠）。  
  * **型定義エラー回避:** import.meta.env の型エラーを (import.meta as any) で回避。

#### **3\. 動作確認**

* 以下のコマンドで、エラーなくイメージがビルドできることを確認しました。  
  * docker build \-f backend/Dockerfile.prod ...  
  * docker build \-f frontend/Dockerfile.prod ...

