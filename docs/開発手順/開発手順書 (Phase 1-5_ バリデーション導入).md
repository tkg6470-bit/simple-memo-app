

# **📘 開発手順書 (Phase 1-5: バリデーション導入)**

本フェーズでは、不正なデータ（空のタイトルや過剰な文字数など）がデータベースに登録されるのを防ぐため、バリデーションライブラリ Zod を導入した。

## **🎯 1\. 目的**

* **データの整合性確保**: アプリケーションが想定していない形式のデータを入り口で遮断する。  
* **セキュリティ向上**: 不正なリクエストによる予期せぬエラーを防ぐ。  
* **責務の分離**: バリデーションロジックをコントローラーから切り出し、コードの可読性を保つ。

## **🛠️ 2\. 使用技術**

* **Zod**: TypeScript ファーストのスキーマ宣言・検証ライブラリ。  
* **@hono/zod-validator**: Hono のミドルウェアとして Zod を使うための公式ツール。

## **📝 3\. 実装手順**

### **3.1 ライブラリのインストール**

バックエンドコンテナ内で以下を実行。

Bash

npm install zod @hono/zod-validator

### **3.2 スキーマ定義 (validators/memoValidator.ts)**

「どのようなデータなら許可するか」というルールを定義したファイルを作成。

* **作成ルール (createMemoSchema)**:  
  * title: 文字列, 必須, 1文字以上100文字以下。  
  * content: 文字列, 必須, 1文字以上。

TypeScript

import { z } from 'zod';

export const createMemoSchema \= z.object({  
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内で入力してください'),  
  content: z.string().min(1, '内容は必須です'),  
});

### **3.3 ルートへの適用 (routes/memoRoutes.ts)**

zValidator ミドルウェアを使用し、コントローラー処理の前に検証処理を挟み込んだ。  
検証に失敗した場合、Hono は自動的に 400 Bad Request とエラー詳細を返す。

TypeScript

import { zValidator } from '@hono/zod-validator';  
import { createMemoSchema } from '../validators/memoValidator';

// POSTリクエストの入り口にバリデーションを設置  
app.post(  
  '/',  
  zValidator('json', createMemoSchema), // ここで門番がチェック  
  memoController.createMemo             // OKな場合のみここへ進む  
);

### **3.4 コントローラー (controllers/memoController.ts)**

バリデーションはルート側で行われるようになったため、コントローラー内での手動チェック（if (\!title)...）は不要となり、削除が可能になった（今回は安全のため残置）。

## **✅ 4\. 成果確認**

不正なデータ（空のタイトル等）を送信した場合、以下のようなエラーレスポンスが返却されることを確認した。

JSON

{  
  "success": false,  
  "error": {  
    "name": "ZodError",  
    "issues": \[  
      {  
        "message": "タイトルは必須です",  
        "path": \["title"\],  
        ...  
      }  
    \]  
  }  
}

---

### **🚀 次のステップ：ユーザー認証 (Clerk)**

バックエンドの基礎（Hono化、DB連携、環境変数、バリデーション）は完璧に仕上がりました。  
いよいよ、モダンアプリ開発の山場である 「Phase 1-6. ユーザー認証 (Clerk)」 に突入します。  
認証が入ると、「自分のメモは自分しか見られない」というアプリ本来の機能が実現できます。

**次は「認証機能の導入」に進みますか？**