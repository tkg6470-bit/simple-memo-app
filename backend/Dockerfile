# ベースイメージ
FROM node:20-slim

# 作業ディレクトリ
WORKDIR /app

# パッケージ定義をコピー
COPY package*.json ./

# ⚠️ ポイント1: 開発ツールを除外してインストール（高速・軽量化）
RUN npm ci --omit=dev

# ⚠️ ポイント2: ソースコード一式（distフォルダ含む）をコピー
COPY . .

# データベース接続ツールの準備
RUN npx prisma generate

# ⚠️ ポイント3: ビルドコマンド（npm run build）は削除しました！
# 手元で作った dist を使うので、ここでは何もしなくてOKです。

# アプリケーションの起動（tsx ではなく node で動かします）
CMD ["node", "dist/index.js"]