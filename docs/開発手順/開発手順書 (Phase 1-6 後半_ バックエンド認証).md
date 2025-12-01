# **📘 開発手順書 (Phase 1-6 後半: バックエンド認証)**

本フェーズでは、フロントエンドから送られてきた認証トークンを検証し、**「ログインユーザー自身のデータのみ」** を読み書きできるようにバックエンドとデータベースを改修した。

## **🎯 1\. 目的**

* **データ保護**: 他人のメモを閲覧・操作できないようにする（マルチテナントアーキテクチャの基礎）。  
* **APIセキュリティ**: 未認証のリクエストを 401 エラーで遮断する。

## **🛠️ 2\. 実装内容**

### **2.1 環境変数の設定 (.env)**

バックエンドが Clerk の API と通信するための秘密鍵を設定。

CLERK\_SECRET\_KEY=sk\_test\_...

### **2.2 データベース改修 (schema.prisma)**

Memo テーブルに、持ち主を識別する userId カラムを追加。

model Memo {  
  id     Int    @id @default(autoincrement())  
  userId String @map("user\_id") // 追加  
  // ...  
}

マイグレーションを実行し、DB構造を更新した。

### **2.3 認証ミドルウェアの導入 (routes/memoRoutes.ts)**

Hono 用の Clerk ミドルウェアを全ルートに適用。  
これにより、すべてのリクエストで自動的にトークンの検証が行われるようになった。  
import { clerkMiddleware } from '@hono/clerk-auth';  
app.use('\*', clerkMiddleware());

### **2.4 コントローラーの保護 (controllers/memoController.ts)**

getAuth(c) を使用して、リクエストを行ったユーザーの userId を取得。  
ID が存在しない場合は 401 Unauthorized を返し、処理を中断するガード処理を入れた。

### **2.5 サービス層のロジック変更 (services/memoService.ts)**

すべての DB 操作（検索、作成、更新、削除）の条件に userId を追加。  
「IDが一致していても、持ち主 (userId) が違えば操作させない」という鉄壁のロジックにした。  
// 例: 削除処理  
return await prisma.memo.delete({  
  where: {  
    id: id,  
    userId: userId // これにより他人のメモは消せない（存在しない扱いになる）  
  },  
});

## **✅ 3\. フロントエンドとの連携 (App.tsx)**

API リクエストを送る際、HTTPヘッダーにトークンを載せる処理を追加。

headers: { Authorization: \`Bearer ${token}\` }

## **🎉 4\. 成果**

* ログインユーザーごとに「自分だけのメモ帳」として機能するようになった。  
* シークレットウィンドウ等で確認し、データ漏洩がないことを実証した。