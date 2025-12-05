import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// S3クライアントの初期化
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // ⚠️ Supabaseにはこれが必須です
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME!;

// ▼▼▼ 引数を3つに変更（key, buffer, mimeType） ▼▼▼
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
