# backend/Dockerfile
FROM node:20-alpine

# コンテナ内の作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリケーションのコード（index.tsやtsconfig.jsonなど）をコピー
COPY . .

# EXPOSE 8080 はここでは省略しても、docker-compose.ymlのportsでカバーされます

# CMDはdocker-compose.ymlのcommandに任せるため削除
# CMD ["npm", "run", "start"]