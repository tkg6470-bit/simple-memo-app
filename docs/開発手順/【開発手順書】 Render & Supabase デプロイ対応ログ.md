

## ---

**2\. 【開発手順書】 Render & Supabase デプロイ対応ログ**

これまで実行した、Renderへのデプロイ成功と画像アップロード機能の実現のために行った主要な設定・コード修正をまとめます。

### **📄 ドキュメント概要**

| 項目 | 内容 |
| :---- | :---- |
| **プロジェクト名** | Simple Memo App (Backend) |
| **作業目的** | Dev Container環境からRender (Docker) への安定デプロイ、およびSupabase Storage連携の実現 |
| **対象ブランチ** | feature/aws-infrastructure |

### ---

**🛠️ 1\. 環境設定（Render Environment）の徹底修正**

デプロイ初期の認証・接続問題を解決するために、Renderに以下の環境変数を設定しました。

| 変数名 | 修正内容 | 理由 |
| :---- | :---- | :---- |
| AWS\_ACCESS\_KEY\_ID / AWS\_SECRET\_ACCESS\_KEY | **最新のSupabase Access Key ID / Secret Key** に更新 | 古い鍵が使えなかったため、新規作成し、RenderとSupabaseで値を一致させた。 |
| AWS\_ENDPOINT | https://\[PROJECT\_ID\].supabase.co/storage/v1/s3 | dummy 設定を削除し、Supabaseの正しい接続先URLに修正。 |
| AWS\_REGION | ap-northeast-2 | Supabaseで指定されたリージョンに修正。 |
| NODE\_VERSION | 20 | ビルド速度向上とメモリ消費対策のためNode.jsバージョンを固定。 |
| NPM\_CONFIG\_PRODUCTION | false | Renderで開発用依存関係 (typescript, prisma など) をインストールさせるために追加。 |

### ---

**📦 2\. Docker/ビルド設定（メモリ不足対策）の最適化**

Renderの無料プランでのメモリ不足（SIGTERM）を回避するため、以下の変更を行いました。

#### **2.1. backend/Dockerfile の修正（OpenSSLと軽量化）**

| 修正内容 | 理由 |
| :---- | :---- |
| FROM node:20-slim | ベースイメージに軽量版を採用。 |
| **RUN apt-get update \-y && apt-get install \-y openssl** | Prismaがデータベースと通信するために必要な **OpenSSLライブラリ** を追加（libssl.so.1.1 エラー対策）。 |
| RUN npm ci \--omit=dev | npm install ではなく npm ci を使用し、本番環境で不要な devDependencies を除外してインストールを高速化・軽量化。 |
| RUN npx prisma generate | npm install の後に、COPY . . を経てから prisma generate を実行するように順序を修正（Prisma生成時のファイル不足エラー対策）。 |
| **CMD \["node", "dist/index.js"\]** | 起動コマンドを tsx からビルド済みの node dist/index.js に変更。 |

#### **2.2. Render Build Command の調整**

| 修正箇所 | 修正内容 | 理由 |
| :---- | :---- | :---- |
| **Root Directory** | backend | package.json の場所をRenderに正しく認識させるため。 |
| **Docker Command** | **空欄** | Dockerfile の CMD が正しく実行されるようにするため。 |
| **ローカル操作** | git add \-f dist で dist フォルダをGitに強制追加 | Renderでの重いビルド処理をスキップし、ローカルでビルドした成果物を使用するため。 |

### ---

**💾 3\. コード修正（画像アップロード機能の実現）**

画像がSupabaseに保存されなかった問題を解決するため、サービス層とコントローラー層を修正しました。

#### **3.1. backend/src/services/storageService.ts の修正**

| 修正内容 | 理由 |
| :---- | :---- |
| S3Client に **forcePathStyle: true** を追加 | Supabase（S3互換サービス）を利用する際に、接続認証エラーを回避するために必須の設定。 |
| uploadImage 関数の引数 | (key, buffer, mimeType) の **3つ** を受け取るように修正 |

#### **3.2. backend/src/controllers/memoController.ts の修正**

| 修正内容 | 理由 |
| :---- | :---- |
| uploadImage をインポートし、createMemo 関数にロジックを実装 | FormData から画像ファイル (image) を取得し、storageService を呼び出して画像をアップロードする処理を実装。 |
| imageUrl の生成 | AWS\_ENDPOINT を /storage/v1/object/public に置換し、公開バケット用のURLを生成するように修正。 |

#### **3.3. Supabase Storage の修正**

| 修正内容 | 理由 |
| :---- | :---- |
| **Policies** の追加 | images バケットに対し、INSERT (書き込み) や SELECT (読み込み) などの権限を anon (未認証ユーザー) や authenticated (認証済みユーザー) に与えた。 |

### ---

**🌐 4\. フロントエンド（ローカル）接続設定の修正**

| 修正内容 | 理由 |
| :---- | :---- |
| frontend/.env の変数名 | VITE\_API\_URL から **VITE\_API\_BASE\_URL** に変更。 |
| memoApi.ts | URLの末尾に /api を追加し、最終的には **URLをコードに直書き** |

---

**この手順書は、今後の開発やトラブルシューティングの参考にしてください。**