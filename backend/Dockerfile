# ベースイメージ
FROM node:20-slim

# 作業ディレクトリ
WORKDIR /app

# ⚠️ 追加: Prismaに必要なOpenSSLをインストールします
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./ 
RUN npm ci --omit=dev

# 開発ツールを除外してインストール
RUN npm ci --omit=dev

# ソースコード一式（dist含む）をコピー
COPY . .

# データベース接続ツールの準備
# (OpenSSLを入れたので、ここで正しいバージョンが自動検知されます)
RUN npx prisma generate

# アプリケーションの起動
CMD ["node", "dist/index.js"]