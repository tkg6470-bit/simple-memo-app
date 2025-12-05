"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUCKET_NAME = exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
// 環境変数から設定を読み込んで S3クライアントを作成
exports.s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    endpoint: process.env.AWS_ENDPOINT || "http://minio:9000", // Docker内部からのアクセス用
    forcePathStyle: true, // MinIOを使う場合は必須の設定
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});
exports.BUCKET_NAME = process.env.AWS_BUCKET_NAME || "memo-bucket";
