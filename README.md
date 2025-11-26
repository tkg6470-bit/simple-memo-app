Simple Memo App (シンプルメモアプリ)
React, Node.js (Express), PostgreSQL, Docker を使用したフルスタックのメモアプリケーションです。 Docker Compose を用いて環境構築を行い、モダンな開発フロー（コンテナ技術、TypeScript による型安全性）を意識して開発しました。
✨ 機能
基本的な CRUD（作成・読み取り・更新・削除）機能を実装しています。

- Create (作成): タイトルと内容を入力してメモを新規作成
- Read (一覧・詳細): 保存されたメモの一覧表示
- Update (更新): 既存のメモの内容を編集・保存
- Delete (削除): 不要なメモの削除
- その他:
  _ 入力バリデーション（空入力の防止）
  _ 編集中・削除時の UX 考慮（ボタンの切り替えなど）
  🚀 使用技術 (Tech Stack)
  Frontend
- React (v18)
- TypeScript
- Axios (API 通信)
  Backend
- Node.js (v20)
- Express
- TypeScript
- pg (PostgreSQL クライアント)
- cors
  Database
- PostgreSQL (v16)
  Infrastructure / Dev Tools
- Docker / Docker Compose
- Nodemon (ホットリロード開発)
- VS Code (Thunder Client での API テスト)
  🛠️ 環境構築・起動手順
  Docker Desktop がインストールされていることを前提としています。

1. リポジトリのクローン
   git clone <リポジトリの URL>
   cd simple-memo-app
2. アプリケーションの起動
   Docker Compose を使用して、DB、バックエンド、フロントエンドを一括で起動します。
   docker compose up -d
   初回起動時はビルドと依存関係のインストールが行われるため、数分かかる場合があります。
3. アクセス
   ブラウザで以下の URL にアクセスしてください。

- Frontend (アプリ画面): http://localhost:3000
- Backend API: http://localhost:8080

4. 停止方法
   docker compose down
   データを完全にリセットしたい場合は、-v オプションを付けてボリュームも削除してください。
   docker compose down -v
   📂 ディレクトリ構成
   memo-app/
   ├── docker-compose.yml # コンテナ構成定義 (DB, Backend, Frontend)
   ├── backend/ # Express API サーバー
   │ ├── src/
   │ │ └── index.ts # API エントリーポイント & ロジック
   │ ├── package.json
   │ └── Dockerfile
   └── frontend/ # React アプリケーション
   ├── src/
   │ ├── App.tsx # メインコンポーネント
   │ ├── types.ts # 型定義
   │ └── index.tsx
   ├── package.json
   └── Dockerfile
   🔌 API エンドポイント
   メソッド エンドポイント 説明
   GET /api/memos メモ一覧を取得
   POST /api/memos メモを新規作成
   GET /api/memos/:id 特定のメモを取得
   PUT /api/memos/:id メモを更新
   DELETE /api/memos/:id メモを削除
   📝 開発のポイント・工夫点

- Docker 化: 開発環境の差異をなくすため、DB 含め完全 Docker 化しました。
- TypeScript: フロント・バック両方で TypeScript を採用し、型安全性を確保しました。
- ローカル環境の汚染防止: npm install 等のコマンドも Docker コンテナ経由で実行する運用フローを構築しました。
