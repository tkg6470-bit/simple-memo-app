# **🛠️ 運用マニュアル (Operation Manual)**

本ドキュメントは、Simple Memo App の保守・運用・トラブルシューティング手順をまとめたものである。

## **1\. ログ確認手順 (Log Monitoring)**

アプリケーションの挙動がおかしい場合、まずはログを確認する。

### **1.1 リアルタイムログの監視**

\# 全サービスのログを流し見する  
docker compose logs \-f

\# 特定のサービス（バックエンド）のみ見る  
docker compose logs \-f backend

### **1.2 ログの調査ポイント**

* **ERROR**: 500エラーやDB接続エラー等の重大な障害。  
* **WARN**: 軽微な警告。  
* **SQL**: Prismaが出力するクエリログ（デバッグ時）。

## **2\. データベース運用 (Database Operations)**

### **2.1 データのバックアップ (Backup)**

PostgreSQLのデータダンプを取得する。

\# 現在の日時でバックアップファイルを作成  
docker compose exec db pg\_dump \-U user memo\_app\_db \> backup\_$(date \+%Y%m%d).sql

### **2.2 データのリストア (Restore)**

バックアップファイルからデータを復元する。  
注意: 既存のデータは上書きされる。  
\# データを流し込む  
cat backup\_YYYYMMDD.sql | docker compose exec \-T db psql \-U user memo\_app\_db

### **2.3 データベースへの直接接続**

CLIで直接SQLを実行してデータを確認する。

docker compose exec db psql \-U user \-d memo\_app\_db  
\# 終了するには \\q と入力

## **3\. トラブルシューティング (Troubleshooting)**

### **Case 1: コンテナが起動しない**

* **現象**: docker compose up しても Exited になる。  
* **原因**: node\_modules の不整合やポート競合が多い。  
* **対応**:  
  1. 全コンテナを停止・削除: docker compose down  
  2. 依存関係の再インストール: (CONTRIBUTING.md参照)  
  3. キャッシュなしで再ビルド: docker compose up \--build \--force-recreate

### **Case 2: "Connection Refused" エラー**

* **現象**: APIがつながらない。  
* **原因**: バックエンドコンテナが落ちているか、DB起動待ち状態。  
* **対応**:  
  * docker compose ps で backend が Up か確認。  
  * docker compose logs backend でエラーログを確認。

### **Case 3: DBスキーマの変更が反映されない**

* **原因**: マイグレーションが実行されていない。  
* **対応**:  
  docker compose run \--rm backend npx prisma migrate dev

## **4\. 定期メンテナンス (Maintenance)**

### **4.1 セキュリティアップデート**

定期的に依存パッケージの脆弱性をチェックし、更新する。

\# 脆弱性スキャン  
docker compose run \--rm backend npm audit  
docker compose run \--rm frontend npm audit

Created by \[Your Name\] \- 2025