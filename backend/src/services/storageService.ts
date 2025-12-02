import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "../utils/s3Client";
import { v4 as uuidv4 } from "uuid"; // ファイル名が被らないようにランダム生成

export const uploadImage = async (
  file: File | Blob,
  mimeType: string
): Promise<string> => {
  // 1. ランダムなファイル名を生成 (例: abc-123.png)
  const extension = mimeType.split("/")[1] || "png";
  const fileName = `${uuidv4()}.${extension}`;

  // 2. データを配列バッファに変換
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 3. S3 (MinIO) にアップロード
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: mimeType,
      // ACL: 'public-read', // MinIOの設定によっては不要ですが念のため
    })
  );

  // 4. 画像のURLを生成して返す
  // ブラウザから見えるURL (AWS_PUBLIC_ENDPOINT) を使う
  const publicEndpoint =
    process.env.AWS_PUBLIC_ENDPOINT || "http://localhost:9000";
  return `${publicEndpoint}/${BUCKET_NAME}/${fileName}`;
};
