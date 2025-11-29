# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# 依存関係ファイルのコピーとインストール
COPY package*.json ./
# RUN npm install

# ソースコードのコピー
COPY . .

# Viteの開発サーバーはデフォルトで5173ポートを使います
EXPOSE 5173

# ホスト(Mac)からアクセスできるように --host オプションをつけます
CMD ["npm", "run", "dev", "--", "--host"]