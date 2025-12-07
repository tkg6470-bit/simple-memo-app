# ベースイメージ
FROM node:20-slim

# 作業ディレクトリ
WORKDIR /app

# Prismaに必要なOpenSSLをインストール
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./ 

# 【修正1】 "--omit=dev" を削除
# ビルドには TypeScript (devDependencies) が必要なため、全てインストールします
RUN npm install

# ソースコード一式をコピー
COPY . .

# 【修正2】 ビルドコマンドを追加
# これで最新の src/index.ts から 新しい dist/index.js が生成されます！
RUN npm run build

# データベース接続ツールの準備
RUN npx prisma generate

# アプリケーションの起動
CMD ["node", "dist/index.js"]