シンプルメモアプリ 設計ドキュメント

1. 要件定義書
   1.1 プロジェクト概要

- プロジェクト名: Simple Memo App (シンプルメモアプリ)
- 目的: フルスタック開発（React, Node.js, PostgreSQL, Docker）の学習および、基本的な CRUD 機能の実装手法を習得する。
- ターゲット: 開発者自身（学習用ポートフォリオ）
  1.2 機能要件
  本アプリケーションは、以下の CRUD 機能を備える。
  |
  | 機能 | 概要 | | 作成 (Create) | タイトルと内容を入力し、新しいメモを保存する。 | | 読取 (Read) | 保存されたメモの一覧を表示する。また、メモの詳細を確認できる。 | | 更新 (Update) | 既存のメモの内容（タイトル、本文）を編集し、更新する。 | | 削除 (Delete) | 不要なメモを削除する。 |
  1.3 非機能要件
- ユーザビリティ: 直感的な操作が可能で、入力チェック（バリデーション）により誤操作を防ぐ。
- パフォーマンス: 快適なレスポンス速度を維持する。
- 保守性: Docker を使用し、環境差異のない開発環境を提供する。
- 拡張性: 将来的な機能追加（検索機能、タグ付けなど）を考慮したシンプルな設計とする。

2. 基本設計書
   2.1 システムアーキテクチャ
   Docker Compose により、以下の 3 つのコンテナを連携させて動作させる。
   graph LR
   User((User)) -- Browser --> Frontend[Frontend Container<br>(React)]
   Frontend -- JSON/HTTP --> Backend[Backend Container<br>(Node.js/Express)]
   Backend -- SQL --> DB[(Database Container<br>PostgreSQL)]

2.2 技術スタック
| カテゴリ | 技術要素 | バージョン (目安) | 役割 | | Frontend | React (TypeScript) | 18.x | UI 構築、API 通信 (Axios) | | Backend | Node.js (Express) | 20.x | REST API 提供、ビジネスロジック | | Database | PostgreSQL | 16.x | データ永続化 | | Infra | Docker / Compose | - | 環境構築・管理 | | Language | TypeScript | 5.x | 型安全なコード記述 |
2.3 ディレクトリ構成
memo-app/
├── docker-compose.yml # サービス全体の定義
├── .gitignore # Git 除外設定
├── backend/ # バックエンド (Express)
│ ├── src/
│ │ └── index.ts # エントリーポイント & API ロジック
│ ├── package.json
│ ├── tsconfig.json
│ └── Dockerfile
└── frontend/ # フロントエンド (React)
├── public/
├── src/
│ ├── App.tsx # メインコンポーネント
│ ├── index.tsx # エントリーポイント
│ └── types.ts # 型定義
├── package.json
├── tsconfig.json
└── Dockerfile

3. 詳細設計書
   3.1 データベース設計
   テーブル名: memos
   | カラム名 | データ型 | 制約 | 説明 | | id | SERIAL | PRIMARY KEY | メモを一意に識別する ID | | title | VARCHAR(255) | NOT NULL | メモのタイトル | | content | TEXT | NOT NULL | メモの本文 | | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 作成日時 | | updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 更新日時 |
   3.2 API インターフェース設計
   ベース URL: http://localhost:8080/api
   | メソッド | エンドポイント | 概要 | リクエストボディ例 | レスポンス例 (成功時) | | GET | /memos | 一覧取得 | - | [{ "id": 1, ... }] (200) | | POST | /memos | 新規作成 | {"title": "...", "content": "..."} | {"id": 1, ...} (201) | | GET | /memos/:id | 詳細取得 | - | {"id": 1, ...} (200) | | PUT | /memos/:id | 更新 | {"title": "...", "content": "..."} | {"id": 1, ...} (200) | | DELETE | /memos/:id | 削除 | - | なし (204) |
   3.3 フロントエンド設計
   画面構成
   シングルページアプリケーション (SPA) として、1 つの画面内で全ての操作を完結させる。
1. ヘッダー: アプリタイトル表示
1. 入力フォームエリア:
   - タイトル入力欄 (input[type="text"])
   - 内容入力欄 (textarea)
   - 追加ボタン (button) - 入力が空の場合は無効化(disabled)
1. メモ一覧エリア:
   _ メモカードのリスト表示
   _ 各カード内に「編集」「削除」ボタンを配置 \* 編集モード時は、カード自体が入力フォームに切り替わる
   コンポーネント設計 (主な State 管理)
   | State 名 | 型 | 初期値 | 用途 | | memos | Memo[] | [] | API から取得したメモ一覧を保持 | | title | string | '' | 新規作成フォームのタイトル入力値 | | content | string | '' | 新規作成フォームの内容入力値 | | editingId | number | null | null | 現在編集中のメモ ID (null なら通常モード) | | editTitle | string | '' | 編集中のタイトル入力値 | | editContent | string | '' | 編集中の内容入力値 |
