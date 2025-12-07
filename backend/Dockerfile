# ベースイメージ
FROM node:20-slim

# 作業ディレクトリ
WORKDIR /app

# Prismaに必要なOpenSSLをインストール
RUN apt-get update -y && apt-get install -y openssl ca-certificates

COPY package*.json ./ 

# 依存関係のインストール（ビルドツール含む）
RUN npm install

# ソースコード一式をコピー
COPY . .

# ビルド実行 (TypeScript -> JavaScript)
RUN npm run build

# Prismaクライアントの生成
RUN npx prisma generate

# 【修正箇所】起動コマンドを変更
# 自動でマイグレーションを実行し、成功したらサーバーを起動します
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]