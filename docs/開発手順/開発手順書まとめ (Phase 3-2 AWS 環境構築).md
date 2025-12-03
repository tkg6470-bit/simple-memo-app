### **📘 開発手順書まとめ (Phase 3-2 AWS 環境構築)**

#### **1\. AWS 操作環境の構築**

ホストマシン (Mac) を汚さず、すべての AWS 操作を Docker コンテナ内で行う環境を構築しました。

* **backend/Dockerfile の修正**  
  * 開発用コンテナに AWS CLI をインストールする手順を追加。  
  * M1/M2 Mac (ARM64) と Intel Mac (x86\_64) の両方に対応するスクリプトを実装。  
* **.env ファイルの設定**  
  * AWS\_ACCESS\_KEY\_ID, AWS\_SECRET\_ACCESS\_KEY, AWS\_DEFAULT\_REGION を定義し、コンテナ内から AWS 認証を通すように設定。

#### **2\. Amazon ECR (Elastic Container Registry) の構築**

Docker イメージを保存するためのリポジトリを AWS 上に作成しました。

* **リポジトリ作成コマンド (コンテナ内実行)**  
  Bash  
  aws ecr create-repository \--repository-name memo-backend \--region ap-northeast-1  
  aws ecr create-repository \--repository-name memo-frontend \--region ap-northeast-1

* **Docker イメージのプッシュ (ホスト側実行)**  
  * docker build \--platform linux/amd64 ... で本番用イメージを作成。  
  * aws ecr get-login-password で認証トークンを取得し、docker login。  
  * docker push で ECR へアップロード完了。

#### **3\. Amazon RDS (PostgreSQL) の構築**

本番用のデータベースサーバーを構築し、スキーマを適用しました。

* **RDS インスタンス作成 (AWS コンソール)**  
  * Engine: PostgreSQL 16.x  
  * Class: db.t3.micro (無料枠)  
  * Public Access: Yes (開発中のマイグレーション実行のため)  
* **セキュリティグループ設定**  
  * インバウンドルールで PostgreSQL (5432) ポートを許可。  
* **本番マイグレーション (コンテナ内実行)**  
  * DATABASE\_URL 環境変数を RDS のエンドポイントに書き換えて npx prisma migrate deploy を実行し、テーブルを作成。

#### **4\. IAM 権限設定 (トラブルシューティング)**

App Runner や ECR を操作するために必要な権限を IAM ユーザーに付与しました。

* **ポリシーのアタッチ:** AmazonEC2ContainerRegistryFullAccess, AWSAppRunnerFullAccess, AdministratorAccess (一時的)。  
* **サービスリンクロールの作成:** aws iam create-service-linked-role コマンドで App Runner 用のロールを手動作成。

#### **5\. AWS App Runner のデプロイ (現在待機中)**

* コンテナイメージ (memo-backend) を指定してサービスの作成を試行。  
* **現状:** AWS アカウント作成直後の制限 (OptInRequired) によりデプロイ保留中。サポートへ解除申請済み。

### ---

**📝 今後の再開手順**

AWS サポートから制限解除の連絡が来たら、以下の手順で作業を再開してください。

1. **AWS コンソールにログイン** し、App Runner の作成画面へ移動。  
2. **「ソースとデプロイ」** で ECR の画像 (memo-backend) を選択。  
3. **「設定」** で環境変数 (DATABASE\_URL, OPENAI\_API\_KEY 等) を入力。  
4. **「作成とデプロイ」** を実行。

### ---

**🛑 終了時の注意 (課金対策)**

作業を中断する際は、必ず以下のリソースを停止・削除して課金を防いでください。

1. **RDS:** 「一時的に停止」を選択（7日後に自動起動するので注意）。  
2. **App Runner:** もし作成に成功していた場合は「サービスを削除」。  
3. **ECR:** そのままでOK（容量課金のみで安価）。

これで Phase 3-2 の手順書は完了です！制限が解除されるのを待ちつつ、まずはゆっくり休んでください。