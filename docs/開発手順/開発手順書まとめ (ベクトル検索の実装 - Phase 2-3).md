

### **📘 開発手順書まとめ (ベクトル検索の実装 \- Phase 2-3)**

この手順書は、次回以降の機能追加や、チームメンバーへの共有にも役立ちます。

#### **1\. 環境構築 (pgvector 導入)**

* **docker-compose.yml の修正**  
  * db サービスのイメージを pgvector/pgvector:pg16 に変更。  
  * backend サービスの command を削除（Dockerfile のデフォルト CMD を利用）し、安定起動するように修正。  
  * POSTTRES\_USER のタイポを POSTGRES\_USER に修正。  
  * YAML構文エラーやインデントをクリーンアップ。

#### **2\. データベース設定 (Prisma & Migration)**

* **schema.prisma の修正**  
  * Memo モデルに embedding Unsupported("vector(1536)")? カラムを追加。  
* **マイグレーションの実行**  
  * npx prisma migrate dev \--create-only \--name add\_vector\_search でマイグレーションファイルを生成。  
  * 生成された SQL ファイルの先頭に CREATE EXTENSION IF NOT EXISTS vector; を追記。  
  * npx prisma migrate dev で適用。

#### **3\. バックエンド実装 (Controller & Service)**

* **aiService.ts の作成**  
  * OpenAI API をモック化し、ダミーのベクトルを返す generateEmbedding 関数を実装（課金回避のため）。  
* **memoController.ts の修正**  
  * **認証回避:** getAuthForTest ヘルパーを作成し、テスト中は認証をスキップ。  
  * **ベクトル保存:** createMemo 内で、メモ作成後に aiService でベクトルを生成し、Prisma の $executeRaw で DB に保存。  
  * **ベクトル検索:** searchMemos 内で、クエリをベクトル化し、Prisma の $queryRaw でコサイン類似度検索を実行。  
  * **デバッグ対応:** エラー詳細 (details) をレスポンスに含めるように修正。BigInt 型のシリアライズエラー対策を追加。

#### **4\. ルーティング設定**

* **memoRoutes.ts の修正**  
  * app.get("/search", ...) を定義。  
  * **重要:** /search の定義を /:id よりも **先** に配置し、ルーティング競合を回避。

#### **5\. 動作確認 (Testing)**

* **curl による API テスト**  
  * メモ作成 (POST): 正常に ID が返ってくることを確認。  
  * ベクトル検索 (GET): 検索クエリに対して、類似度付きのメモリストが返ってくることを確認。

