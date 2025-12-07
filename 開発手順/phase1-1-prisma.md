

---

### **🌳 1\. Gitブランチの運用**

現在の feature/phase1-1-prisma は「バックエンド完成」として一度区切りをつけ、main に統合してから、新しいブランチを作ります。

以下のコマンドを順番に実行してください。

Bash

\# 1\. 現在の作業をコミット（まだしていなければ）  
git add .  
git commit \-m "feat: バックエンド完成 (Prisma CRUD実装)"

\# 2\. mainブランチに戻る  
git checkout main

\# 3\. バックエンドの作業を main に統合（マージ）する  
git merge feature/phase1-1-prisma

\# 4\. ここまでの内容をリモート（GitHub等）にも反映  
git push origin main

\# 5\. フロントエンド開発用の新ブランチを作成して切り替える  
git checkout \-b feature/phase2-frontend

これで、心置きなくフロントエンド開発に進める状態になりました。

---

### **📘 2\. 開発手順書まとめ（Phase 1: バックエンド構築編）**

今回行った作業の決定版マニュアルです。今後、似たような環境を作る際の参考にしてください。

#### **✅ Step 1: 依存パッケージのインストールと初期化**

Prisma（v5系）とクライアントをインストールしました。  
※ v7系は不安定だったため v5 を採用。

Bash

\# Prisma本体とクライアントのインストール  
docker compose run \--rm backend npm install prisma@5 @prisma/client@5

\# Prismaの初期化（prismaフォルダとschema.prismaの生成）  
docker compose run \--rm backend npx prisma init

#### **✅ Step 2: 環境設定 (Dockerfile & schema.prisma)**

Mac (M1/M2/M3) と Docker (Alpine Linux) の相性問題を解決するために設定を行いました。

1\. backend/Dockerfile の修正  
OpenSSLをOSに追加インストールする記述を追加。

Dockerfile

FROM node:20\-alpine  
RUN apk add \--no-cache openssl  \# \<-- これを追加  
WORKDIR /app  
\# ... (以下略)

2\. prisma/schema.prisma の修正  
binaryTargets を追加し、Docker(Linux)用のバイナリを指定。

コード スニペット

generator client {  
  provider      \= "prisma-client-js"  
  binaryTargets \= \["native", "linux-musl-openssl-3.0.x"\]  
}

※ その後、docker compose build \--no-cache でイメージを再ビルドしました。

#### **✅ Step 3: データモデル定義とマイグレーション**

schema.prisma に Memo モデルを定義し、DBにテーブルを作成しました。

Bash

\# マイグレーション実行（DBにテーブルを作成）  
docker compose run \--rm backend npx prisma migrate dev \--name init

#### **✅ Step 4: APIの実装 (index.ts)**

ExpressとPrismaClientを使って、4つの機能（CRUD）を実装しました。

* GET /memos : 一覧取得  
* POST /memos : 新規作成  
* PUT /memos/:id : 更新  
* DELETE /memos/:id : 削除

#### **✅ Step 5: 起動と動作確認**

**サーバーの起動（開発モード）:**

Bash

docker compose run \--rm \--service-ports backend npx ts-node index.ts

※ ポート8080で待機。

**管理画面 (Prisma Studio) の起動:**

Bash

docker compose run \--rm \-p 5556:5556 backend npx prisma studio \--browser none \--port 5556

※ ポート重複を避けるため 5556 を使用。