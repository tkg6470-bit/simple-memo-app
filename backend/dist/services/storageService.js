"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3Client_1 = require("../utils/s3Client");
const uuid_1 = require("uuid"); // ファイル名が被らないようにランダム生成
const uploadImage = async (file, mimeType) => {
    // 1. ランダムなファイル名を生成 (例: abc-123.png)
    const extension = mimeType.split("/")[1] || "png";
    const fileName = `${(0, uuid_1.v4)()}.${extension}`;
    // 2. データを配列バッファに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // 3. S3 (MinIO) にアップロード
    await s3Client_1.s3Client.send(new client_s3_1.PutObjectCommand({
        Bucket: s3Client_1.BUCKET_NAME,
        Key: fileName,
        Body: buffer,
        ContentType: mimeType,
        // ACL: 'public-read', // MinIOの設定によっては不要ですが念のため
    }));
    // 4. 画像のURLを生成して返す
    // ブラウザから見えるURL (AWS_PUBLIC_ENDPOINT) を使う
    const publicEndpoint = process.env.AWS_PUBLIC_ENDPOINT || "http://localhost:9000";
    return `${publicEndpoint}/${s3Client_1.BUCKET_NAME}/${fileName}`;
};
exports.uploadImage = uploadImage;
