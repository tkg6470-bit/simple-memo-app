# ==========================================
# Phase 3-1: Production Optimized Dockerfile
# ==========================================

# ベースイメージ: 軽量な Node.js 20 (Slim版)
FROM node:20-slim

# 作業ディレクトリ
WORKDIR /app

COPY package*.json ./

# 1. installを実行
RUN npm install

# 2. ソースコードをコピー
COPY . .

# 3. コピーした後にPrismaを生成（これを追加！）
RUN npx prisma generate

# 4. ビルド（TypeScript -> JavaScript）
RUN npm run build

# 5. アプリケーションの起動
# npm run dev (watch mode) ではなく、tsx で直接実行します
# ※ Render は PORT 環境変数を自動で渡すので、コード内で process.env.PORT を使う想定です
CMD ["npx", "tsx", "src/index.ts"]