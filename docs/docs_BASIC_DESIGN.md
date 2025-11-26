# **📘 基本設計書 (Basic Design Document)**

## **1\. システム構成図 (System Architecture)**

AWS App Runner を中心としたコンテナネイティブな構成を採用する。

graph TD  
 User\[User (Browser/Mobile)\] \--\>|HTTPS| AppRunner\[AWS App Runner\]

    subgraph AWS Cloud
        AppRunner \--\>|Backend API| NodeContainer\[Node.js Container\]
        NodeContainer \--\>|SQL| RDS\[Amazon RDS (PostgreSQL)\]
        NodeContainer \--\>|Presigned URL| S3\[Amazon S3 (Image Storage)\]
    end

    subgraph External Services
        NodeContainer \--\>|API Call| OpenAI\[OpenAI API\]
        NodeContainer \--\>|Auth| Clerk\[Clerk Auth\]
    end

## **2\. 画面遷移図 (Screen Transition Diagram)**

graph LR  
 Login\[ログイン画面\] \--\>|認証成功| List\[メモ一覧画面 (Dashboard)\]  
 List \--\>|新規作成ボタン| Create\[新規作成モーダル\]  
 List \--\>|メモクリック| Detail\[メモ詳細・編集画面\]  
 List \--\>|検索| SearchResult\[検索結果\]  
 Create \--\>|保存| List  
 Detail \--\>|更新/削除| List

## **3\. 画面定義 (Screen Definitions)**

### **S-01: ログイン画面**

- **概要**: ユーザー認証を行う。
- **主要要素**:
  - 「Google でログイン」ボタン
  - メールアドレス・パスワード入力フォーム（Clerk 提供）

### **S-02: メモ一覧画面 (Dashboard)**

- **概要**: 自分のメモを一覧表示するホーム画面。
- **主要要素**:
  - **ヘッダー**: アプリロゴ、ログアウトボタン。
  - **作成フォーム**: タイトル・本文入力欄、「追加」ボタン。
  - **メモリスト**: カード形式でメモを表示（タイトル、本文抜粋、更新日時）。
  - **操作ボタン**: 各カードに「編集」「削除」ボタン。

### **S-03: メモ詳細・編集画面 (Modal/Inline)**

- **概要**: 既存メモの閲覧および編集を行う。現状は一覧画面内でのインライン編集を採用。
- **主要要素**:
  - タイトル編集フォーム
  - 本文編集フォーム（テキストエリア）
  - 「保存」ボタン、「キャンセル」ボタン
  - 「AI 要約」ボタン（Phase 2 実装予定）
