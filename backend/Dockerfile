FROM node:20-slim

WORKDIR /app

# 1. 必要なツールと AWS CLI のインストール (マルチアーキテクチャ対応)
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    procps \
    && \
    # アーキテクチャを判別してダウンロードURLを切り替える
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ]; then \
      curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; \
    else \
      curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
    fi \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip ./aws \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 2. 以降は標準的なNodeの設定
COPY package*.json ./

# 開発用なので devDependencies も含めてインストール
RUN npm install

# ソースコードは docker-compose の volumes でマウントされるため、
# ここでの COPY . . は必須ではありませんが、一応入れておきます
COPY . .

# Prisma の生成
RUN npx prisma generate

# サーバー起動 (docker-compose.ymlのcommandで上書きされる場合もありますが、デフォルトを指定)
CMD ["npm", "run", "dev"]