# **📐 詳細設計書 (Detailed Design Document)**

## **1\. API処理ロジック (API Logic)**

### **1.1 メモ作成処理 (POST /api/memos)**

1. **認証チェック**: リクエストヘッダーのトークンを検証し、user\_id を特定する。  
2. **バリデーション**: Zodを使用し、以下のルールで入力を検証する。  
   * title: 必須、1文字以上255文字以下。  
   * content: 必須、1文字以上。  
3. **DB保存**: prisma.memo.create() を実行。  
4. **レスポンス**: 作成されたメモオブジェクトとステータスコード 201 を返す。  
5. **エラー処理**: 必須項目欠落時は 400 Bad Request を返す。

### **1.2 メモ更新処理 (PUT /api/memos/:id)**

1. **認証チェック**: リクエストユーザーとメモの所有者 (user\_id) が一致するか確認する。  
2. **存在確認**: 指定された id のメモが存在するか確認。なければ 404。  
3. **権限確認**: 他人のメモを更新しようとした場合は 403 Forbidden。  
4. **DB更新**: prisma.memo.update() を実行。updated\_at は自動更新。

## **2\. ディレクトリ・モジュール構成 (Module Structure)**

backend/src/  
├── controllers/       \# リクエストを受け取り、レスポンスを返す層  
│   └── memoController.ts  
├── services/          \# ビジネスロジック（DB操作、AI処理など）を実行する層  
│   └── memoService.ts  
├── routes/            \# URLルーティング定義  
│   └── memoRoutes.ts  
├── utils/             \# 共通関数  
│   └── validate.ts  
└── index.ts           \# アプリケーションエントリーポイント  
