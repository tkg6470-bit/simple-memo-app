"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
// S3クライアントの初期化
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    endpoint: process.env.AWS_ENDPOINT,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true, // ⚠️ Supabaseにはこれが必須です
});
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
// ▼▼▼ 引数を3つに変更（key, buffer, mimeType） ▼▼▼
const uploadImage = async (key, buffer, mimeType) => {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
    });
    await s3Client.send(command);
};
exports.uploadImage = uploadImage;
