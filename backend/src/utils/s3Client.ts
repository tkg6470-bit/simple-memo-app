import { S3Client } from "@aws-sdk/client-s3";

// 環境変数から設定を読み込んで S3クライアントを作成
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.AWS_ENDPOINT || "http://minio:9000", // Docker内部からのアクセス用
  forcePathStyle: true, // MinIOを使う場合は必須の設定
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "memo-bucket";
