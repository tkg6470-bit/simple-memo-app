# ==========================================
# Phase 3-1: Production Optimized Dockerfile
# ==========================================

# ベースイメージ: 軽量な Node.js 20 (Slim版)
FROM node:20-slim

# 作業ディレクトリ
WORKDIR /app

# 1. システム依存関係のインストール
# Prisma が Linux (Slim) で動くために openssl が必要です
RUN apt-get update && apt-get install -y \
    openssl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. パッケージ定義のコピー & インストール
COPY package*.json ./

# 本番環境でも tsx などを使うため、ci ではなく install を使います
# (厳密な軽量化より安定性重視)
RUN npm install

# 3. ソースコードのコピー
COPY . .

# 4. Prisma クライアントの生成 (必須)
# これがないと "PrismaClientInitializationError" で落ちます
RUN npx prisma generate

# 5. アプリケーションの起動
# npm run dev (watch mode) ではなく、tsx で直接実行します
# ※ Render は PORT 環境変数を自動で渡すので、コード内で process.env.PORT を使う想定です
CMD ["npx", "tsx", "src/index.ts"]