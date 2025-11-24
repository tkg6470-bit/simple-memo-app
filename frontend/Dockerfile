FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# 依存関係の競合を無視してインストール
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start"]