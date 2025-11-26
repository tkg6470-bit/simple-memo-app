# **📋 要件定義書 (System Requirements Specification)**

Project Name: Simple Memo App (Enhanced Edition)  
Version: 1.4.0 (Complete)  
本ドキュメントは、モダンな自社開発企業が採用する技術スタックと開発フローを再現した、フルスタックメモアプリケーションの要件を定義するものである。

## **1\. プロジェクト概要**

### **1.1 目的**

* **技術力の証明**: 未経験から即戦力レベルのモダン技術（TypeScript, Docker, AWS, IaC, AI連携）を扱えることを証明するポートフォリオの作成。  
* **実務シミュレーション**: 単機能の実装にとどまらず、運用・保守・拡張性・セキュリティを考慮したアーキテクチャを構築する。

### **1.2 ターゲットユーザー**

* **ユーザー**: メモを効率的に管理・活用したい個人ユーザー。PCおよびスマートフォンで利用する。  
* **ステークホルダー**: 採用担当者（技術選定の妥当性と実装力を評価する）。

### **1.3 予算戦略 (Cost Strategy)**

* **Phase 1 (ローカル開発)**: **完全無料 (¥0)**  
* **Phase 2 (クラウド構築) 以降**: **AWS利用料のみ発生** (無料枠活用、App Runner一時停止運用)。

## **2\. 機能要件 (Functional Requirements)**

### **2.1 基本機能 (Core Features)**

| ID | 機能名 | 詳細 |
| :---- | :---- | :---- |
| **F-01** | **メモ作成** | タイトル・本文を入力し保存する。画像添付も可能(S3連携)。 |
| **F-02** | **メモ閲覧** | 一覧表示および詳細表示。作成日順でのソート。 |
| **F-03** | **メモ編集** | 既存メモの内容を修正・更新する。 |
| **F-04** | **メモ削除** | 不要なメモを削除する。 |

### **2.2 認証・認可 (Auth)**

| ID | 機能名 | 詳細 |
| :---- | :---- | :---- |
| **F-05** | **ユーザー登録/ログイン** | Clerk/Auth0を用いたセキュアな認証。 |
| **F-06** | **データ分離** | ログインユーザー自身のデータのみにアクセス権を限定する。 |

### **2.3 AI・高度機能 (Advanced Features)**

| ID | 機能名 | 詳細 |
| :---- | :---- | :---- |
| **F-07** | **AI自動要約** | OpenAI APIを利用し、長文メモを3行で要約して保存する。 |
| **F-08** | **ベクトル検索 (RAG)** | pgvectorを利用し、意味検索を実現する。 |
| **F-09** | **MCPサーバー連携** | AIエージェントからメモを操作可能にするインターフェース。 |

## **3\. 非機能要件 (Non-Functional Requirements)**

### **3.1 セキュリティ & インフラ**

* **機密情報**: .env 管理を徹底。  
* **入力値検証**: Zod による厳格なバリデーション。  
* **可用性**: AWS App Runner (コンテナ) \+ RDS (DB) \+ S3 (ストレージ) の構成。

### **3.2 品質・保守性**

* **型安全性**: TypeScript全面採用。  
* **アーキテクチャ**: 「関心の分離」に基づき、ルーティングとビジネスロジックを分離する。  
* **テスト**: Vitest (単体) / Playwright (E2E) の実装。

### **3.3 パフォーマンス目標**

* **APIレスポンス**: 通常のCRUD操作は **500ms以内** にレスポンスを返すこと。  
* **AI処理**: 時間のかかるAI処理（数秒〜）は非同期で行い、UIをブロックしないこと。

## **4\. UI/UX ガイドライン (User Interface & Experience)**

### **4.1 デザイン原則**

* **モバイルファースト**: スマートフォンでの操作（タップしやすさ、画面幅への追従）を最優先に設計する。  
* **シンプル＆ミニマル**: 学習コストのかからない直感的なUIを目指す。過度な装飾は避ける。

### **4.2 画面構成案**

1. **認証画面**: ログイン / サインアップ（Clerk提供UIを使用）。  
2. **ダッシュボード（一覧）**:  
   * メモのカード表示（タイトル、要約、更新日）。  
   * 新規作成ボタン（FAB: Floating Action Button）。  
   * 検索バー（AI意味検索対応）。  
3. **編集・詳細画面**:  
   * タイトル・本文の入力エリア。  
   * 画像アップロードエリア。  
   * AI要約ボタン。

## **5\. システム設計詳細 (System Design)**

### **5.1 技術スタック**

React (Vite), TypeScript, Node.js (Express), Prisma, PostgreSQL, AWS (App Runner, S3), Terraform, GitHub Actions.

### **5.2 データモデル (ER Diagram)**

erDiagram  
    User ||--o{ Memo : "has many"  
    User {  
        string id PK "Auth Provider ID"  
        string email  
        string name  
    }  
    Memo {  
        int id PK  
        string user\_id FK  
        string title  
        string content  
        string image\_url "S3 URL"  
        vector embedding "For AI Search"  
        datetime created\_at  
        datetime updated\_at  
    }

### **5.3 ディレクトリ構成設計 (Target Structure)**

現在の index.ts 一極集中から、以下の構成へリファクタリングを行う。

backend/src/  
├── config/         \# 環境変数やDB接続設定  
├── controllers/    \# リクエスト処理・レスポンス返却  
├── routes/         \# APIルーティング定義  
├── services/       \# ビジネスロジック (AI処理など)  
├── utils/          \# 共通関数 (バリデーション等)  
├── app.ts          \# Express設定  
└── index.ts        \# エントリーポイント

### **5.4 API インターフェース詳細**

Base URL: /api

| Method | Endpoint | Request Body | Response (200/201) |
| :---- | :---- | :---- | :---- |
| GET | /memos | \- | Memo\[\] |
| POST | /memos | { title, content } | Memo |
| GET | /memos/:id | \- | Memo |
| PUT | /memos/:id | { title?, content? } | Memo |
| DELETE | /memos/:id | \- | (Empty) |
| POST | /memos/:id/summarize | \- | { summary: string } |

## **6\. 開発運用ルール (Development & Operations Rules)**

### **6.1 バージョン管理・ブランチ戦略**

* **フロー**: GitHub Flow (main \+ feature ブランチ)。  
* **コミットメッセージ**: Feat:, Fix:, Refactor: 等のプレフィックスを付与。

### **6.2 エラーハンドリング設計**

APIは以下のHTTPステータスコードを適切に返却し、フロントエンドはこれに基づいてUIを制御する。

| コード | 意味 | フロントエンドの挙動 |
| :---- | :---- | :---- |
| **200/201** | OK/Created | 成功メッセージを表示または画面遷移。 |
| **400** | Bad Request | 入力エラー箇所をハイライト表示（Zod連携）。 |
| **401** | Unauthorized | ログイン画面へリダイレクト。 |
| **404** | Not Found | 404ページまたは一覧へリダイレクト。 |
| **500** | Internal Error | 「システムエラーが発生しました」とトースト表示。 |

### **6.3 コスト管理 (AWS)**

* **リソース停止**: 本番環境（Phase 2以降）の App Runner 等の従量課金リソースは、デモや面接時以外は「一時停止」または「削除」し、不要なコスト発生を防ぐ。

## **7\. 制約事項・前提条件 (Constraints)**

* **ブラウザサポート**: Google Chrome, Safari, Edge, Firefox の最新版のみをサポート対象とする（IE等は非対応）。  
* **言語対応**: 日本語のみとする。  
* **依存サービス**: OpenAI API等の外部サービスが停止した場合、AI機能は利用不可となるが、基本的なメモ機能は継続して利用できる設計とする（Graceful Degradation）。

Created by \[Your Name\] \- 2025