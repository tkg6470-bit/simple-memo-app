### **📘 開発手順書まとめ (Phase 2-3 ベクトル検索 & UI実装)**

このフェーズでは、**バックエンドでのpgvector導入・検索API作成**と、**フロントエンドでの検索UI実装**を行いました。

#### **1\. バックエンド環境構築 (pgvector)**

* **docker-compose.yml の修正**  
  * db サービスを postgres:16-alpine から pgvector/pgvector:pg16 に変更。  
  * backend サービスの command を削除し、Dockerfile のデフォルト CMD を利用（安定起動のため）。  
  * 環境変数 POSTGRES\_USER のタイポ修正。  
* **データベース設定 (Prisma)**  
  * schema.prisma に embedding Unsupported("vector(1536)")? カラムを追加。  
  * マイグレーションを実行し、CREATE EXTENSION IF NOT EXISTS vector; をSQLに追加して適用。

#### **2\. バックエンド実装 (API)**

* **backend/src/services/aiService.ts**  
  * AI連携のモックを作成（ダミーのベクトルを生成）。  
* **backend/src/controllers/memoController.ts**  
  * **認証回避:** テスト用に getAuthForTest ヘルパーを実装。  
  * **ベクトル保存:** createMemo でメモ作成時にベクトルも生成・保存。  
  * **ベクトル検索:** searchMemos で pgvector のコサイン類似度検索 (\<=\>) を実装。  
  * **デバッグ:** エラー詳細を表示するよう修正。  
* **backend/src/routes/memoRoutes.ts**  
  * /search エンドポイントを追加（他のルートより優先度を高く設定）。

#### **3\. フロントエンド実装 (React)**

* **frontend/src/types/memo.ts**  
  * Memo 型に similarity?: number を追加。  
* **frontend/src/api/memoApi.ts**  
  * searchMemos メソッドを追加。認証トークン対応。  
* **frontend/src/App.tsx**  
  * SearchBar コンポーネントを実装。  
  * 検索結果（AI一致度）の表示ロジックを追加。  
  * main.tsx の import.meta.env エラーを修正。

