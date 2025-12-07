import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// S3クライアントの初期化
// 環境変数が読み込めない場合でも、MinIOのデフォルト値を使って接続するように修正
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1", // 👈 ここが空だとエラーになるのでデフォルトを追加
  endpoint: process.env.AWS_ENDPOINT || "http://minio:9000",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "minio_user",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "minio_password",
  },
  forcePathStyle: true, // MinIOには必須
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "memo-bucket";

export const uploadImage = async (
  key: string,
  buffer: Buffer,
  mimeType: string
) => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
  });
  await s3Client.send(command);
};
