

### **📘 開発手順書まとめ (Phase 3-1 Docker最適化)**

このフェーズでは、開発用の環境とは別に、AWSなどの本番環境で運用するための **「軽量・セキュアなコンテナイメージ」** を構築しました。また、厳密なビルドプロセスを通すことで発覚した潜在的なコードのバグを修正しました。

#### **1\. マルチステージビルドの導入**

* **目的**: イメージサイズを削減し、セキュリティを高める（ソースコードや開発ツールを本番イメージに含めない）。  
* **作成ファイル**:  
  * **backend/Dockerfile.prod**:  
    * builder ステージ: 依存関係インストール、Prisma生成、TypeScriptビルド (tsc)。  
    * runner ステージ: ビルド成果物 (dist) と package.json、本番用 node\_modules のみをコピー。非rootユーザー (node) で実行。  
  * **frontend/Dockerfile.prod**:  
    * builder ステージ: Viteビルド (npm run build)。  
    * runner ステージ: 軽量Webサーバー serve を使用し、ビルド成果物 (dist) のみを配信。

#### **2\. コードの品質修正 (ビルドエラー対応)**

開発モード (dev) では許容されていたが、本番ビルド (build) の厳密なチェックで発覚したエラーを修正しました。

* **フロントエンド (frontend/src/main.tsx)**:  
  * **拡張子エラー**: import ... from './App.tsx' から拡張子を削除。  
  * **型定義エラー**: import.meta.env の型エラーを (import.meta as any) で回避。  
* **バックエンド (backend/src/services/memoService.ts)**:  
  * **Prisma型エラー**: orderBy: { created\_at: ... } を、正しいモデル定義である createdAt（キャメルケース）に修正。

#### **3\. 動作確認**

* docker build コマンドにより、バックエンド・フロントエンド共にエラーなくイメージが作成できることを確認。

