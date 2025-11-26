# **🤝 Contributing to Simple Memo App**

開発に参加していただきありがとうございます！  
本プロジェクトは、以下のガイドラインに従って開発を進めています。

## **🛠️ 開発環境のセットアップ (Setup)**

本プロジェクトは Docker を使用して環境を統一しています。  
ローカルの Node.js バージョンに依存しない開発が可能です。

### **1\. 起動 (Start)**

\# コンテナのビルドと起動  
docker compose up \-d

\# ログの確認  
docker compose logs \-f

### **2\. 停止 (Stop)**

docker compose down

### **3\. パッケージの追加 (Add Package)**

npm install は必ず Docker コンテナ経由で行ってください（ローカル環境汚染防止のため）。

\# フロントエンド  
docker compose run \--rm frontend npm install \<package\_name\>

\# バックエンド  
docker compose run \--rm backend npm install \<package\_name\>

## **🌿 ブランチ戦略 (Branching Strategy)**

**GitHub Flow** を採用しています。

1. **main**: 常にデプロイ可能な安定ブランチ。直接コミットは禁止。  
2. **feature/xxx**: 新機能開発用。  
3. **fix/xxx**: バグ修正用。  
4. **refactor/xxx**: リファクタリング用。

作業完了後は main に対して Pull Request (PR) を作成してください。

## **📝 コミットメッセージ規約 (Commit Message)**

以下のプレフィックスを付けてください。

* Feat: 新機能の追加  
* Fix: バグ修正  
* Docs: ドキュメントのみの変更  
* Style: コードの意味に影響しない変更（空白、フォーマットなど）  
* Refactor: バグ修正も機能追加も行わないコードの変更  
* Test: テストの追加・修正  
* Chore: ビルドプロセスや補助ツールの変更

例:  
Feat: メモの削除機能を実装

## **✅ Pull Request (PR) チェックリスト**

PRを出す前に以下を確認してください。

* \[ \] ローカルで正常に動作することを確認したか  
* \[ \] 関連するドキュメント（要件定義書など）を更新したか  
* \[ \] コンソールにエラーや警告が出ていないか  
* \[ \] コードフォーマット（Prettier/ESLint）は適用されているか

Happy Coding\! 🚀