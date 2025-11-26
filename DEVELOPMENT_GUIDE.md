シンプルメモアプリ 開発手順書
本ドキュメントは、React, Node.js, PostgreSQL, Docker を使用したフルスタックメモアプリの構築手順をまとめたものである。

1. 事前準備
   1.1 必要なツール

- Docker Desktop: コンテナ環境の実行に必須。
- VS Code: 推奨エディタ。 \* 拡張機能: Thunder Client (API テスト用)
  1.2 プロジェクト構成
  プロジェクトのルートディレクトリを作成し、以下の構成を目指して開発を進める。
  memo-app/
  ├── docker-compose.yml
  ├── backend/
  └── frontend/

2. 環境構築 (Docker)
   2.1 Docker Compose の定義
   docker-compose.yml を作成し、3 つのサービスを定義する。

- db: PostgreSQL 16 (データ永続化のためボリュームを設定)
- backend: Node.js 20 (API サーバー)
- frontend: Node.js 20 (React 開発サーバー)
  ポイント:
- ホットリロードを有効にするため、ソースコードをボリュームマウントする。
- フロントエンドの node_modules がホスト側と競合しないよう、ボリューム設定に注意する。

3. バックエンド開発 (Node.js/Express)
   3.1 初期設定
1. backend/package.json を作成し、express, pg (PostgreSQL クライアント), cors, typescript, ts-node, nodemon などの依存関係を定義する。
1. Docker コンテナを使用して依存関係をインストールする。# ローカル環境を汚さずにインストール
1. docker run --rm -v "$PWD/backend":/app -w /app node:20-alpine sh -c "npm install && chown -R $(id -u):$(id -g) node_modules"
1. 3.2 データベース接続とテーブル作成
   backend/index.ts にて以下の実装を行う。
1. pg モジュールの Pool を使用して DB に接続する（接続情報は環境変数から取得）。
1. サーバー起動時に CREATE TABLE IF NOT EXISTS を実行し、memos テーブルを自動生成する。
   3.3 API 実装 (CRUD)
   RESTful な API エンドポイントを実装する。

- POST /api/memos: 作成
- GET /api/memos: 一覧取得
- GET /api/memos/:id: 詳細取得
- PUT /api/memos/:id: 更新
- DELETE /api/memos/:id: 削除
  CORS 対応: フロントエンド（ポート 3000）からのアクセスを許可するため、cors ミドルウェアを適用する。
  3.4 動作確認
  VS Code の拡張機能 Thunder Client を使用し、各エンドポイントの動作を確認する。

4. フロントエンド開発 (React/TypeScript)
   4.1 初期設定
1. frontend/package.json を作成し、react, react-dom, axios などの依存関係を定義する。
1. バックエンド同様、Docker を使用して依存関係をインストールする。docker run --rm -v "$PWD/frontend":/app -w /app node:20-alpine sh -c "npm install --legacy-peer-deps && chown -R $(id -u):$(id -g) node_modules"
1. 4.2 型定義とコンポーネント実装
1. 型定義 (types.ts): メモデータのインターフェース (Memo) を定義。
1. メイン画面 (App.tsx):
   - useState, useEffect フックを使用した状態管理。
   - axios を使用したバックエンド API との通信処理。
   - 一覧表示、新規作成フォーム、編集モードの切り替え、削除ボタンの UI 実装。
   - 入力チェックによるボタンの活性/非活性制御。
1. トラブルシューティング記録
   開発中に発生した主要な問題とその解決策。
   5.1 node_modules の同期問題

- 現象: コンテナ内ではライブラリがあるのに、ホスト側（VS Code）で「モジュールが見つからない」エラーが出る。また、react-scripts が見つからないエラーでコンテナが起動しない。
- 原因: Docker のボリュームマウントと、ホスト側のファイルの実在状況の不整合。
- 解決策: 1. docker run コマンドを使用し、ホスト側のディレクトリに直接 node_modules を生成する（所有権限も修正）。 2. docker-compose.yml で明示的に - /app/node_modules をマウントする設定を行い、コンテナ内の環境を守る。
  5.2 サーバーの即時終了
- 現象: バックエンドコンテナが起動直後に Exited (0) で停止する。
- 原因: nodemon の設定不備や、起動コマンドの競合。
- 解決策: package.json の scripts を整理し、docker-compose.yml の command を npm run dev に統一してホットリロードを安定化させた。

6. 起動・操作方法
   6.1 アプリケーションの起動
   プロジェクトルートで以下のコマンドを実行する。
   docker compose up -d
   6.2 アクセス

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8080
  6.3 停止
  docker compose down

7. Git 管理
   7.1 除外設定
   .gitignore ファイルを作成し、以下のファイルを除外する。

- node_modules/
- ビルド生成物 (dist/, build/)
- 環境変数ファイル (.env)
- エディタ設定 (.vscode/)
  7.2 リポジトリへのプッシュ
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin <リポジトリ URL>
  git push -u origin main
